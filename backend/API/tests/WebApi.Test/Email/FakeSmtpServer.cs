using System.Net;
using System.Net.Sockets;
using System.Text;

namespace WebApi.Test.Email;
/// <summary>Servidor SMTP mínimo (sem TLS/AUTH) que guarda a mensagem recebida, para testar o envio de verdade.</summary>
public sealed class FakeSmtpServer : IDisposable
{
    private readonly TcpListener _listener = new(IPAddress.Loopback, 0);
    private readonly Task _loop;
    private readonly TaskCompletionSource<string> _received = new();

    public FakeSmtpServer()
    {
        _listener.Start();
        _loop = Task.Run(Accept);
    }

    public int Port => ((IPEndPoint)_listener.LocalEndpoint).Port;

    /// <summary>Conteúdo bruto (cabeçalhos + corpo) da primeira mensagem recebida.</summary>
    public Task<string> Message => _received.Task;

    private async Task Accept()
    {
        try
        {
            using var client = await _listener.AcceptTcpClientAsync();
            using var stream = client.GetStream();
            using var reader = new StreamReader(stream, Encoding.ASCII);
            using var writer = new StreamWriter(stream, new UTF8Encoding(false)) { NewLine = "\r\n", AutoFlush = true };

            await writer.WriteLineAsync("220 fake.smtp ready");

            var data = new StringBuilder();
            var inData = false;

            while (await reader.ReadLineAsync() is { } line)
            {
                if (inData)
                {
                    if (line == ".")
                    {
                        inData = false;
                        _received.TrySetResult(data.ToString());
                        await writer.WriteLineAsync("250 queued");
                    }
                    else
                    {
                        data.AppendLine(line);
                    }

                    continue;
                }

                var command = line.Split(' ')[0].ToUpperInvariant();

                switch (command)
                {
                    case "EHLO":
                        await writer.WriteLineAsync("250-fake.smtp");
                        await writer.WriteLineAsync("250 8BITMIME");
                        break;
                    case "DATA":
                        inData = true;
                        await writer.WriteLineAsync("354 end with .");
                        break;
                    case "QUIT":
                        await writer.WriteLineAsync("221 bye");
                        return;
                    default:
                        await writer.WriteLineAsync("250 ok");
                        break;
                }
            }
        }
        catch (Exception exception) when (exception is ObjectDisposedException or SocketException or IOException)
        {
            // Servidor encerrado pelo teste.
        }
    }

    public void Dispose()
    {
        _listener.Stop();
        _loop.Wait(TimeSpan.FromSeconds(1));
    }
}
