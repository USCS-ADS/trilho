import { Input } from "./components/input";

export default function Home() {
  return (
    <main className="flex flex-row flex-center h-[100vh]">

      <section className="border-r-2 border-gray-300 p-8 w-[45%] flex flex-col justify-center">
        <div>T</div>
        <h1>Trilho</h1>
        <p>Gestão inteligente de times e projetos de desenvolvimento. Kanban colobarativo, priorização por IA e integração nativa com Git</p>
      </section>

      <section className="p-8 w-[55%] flex flex-col justify-center gap-4">
        <h1>Bem-vindo(a) de volta</h1>
        <form>
          <Input type="text" label="E-mail" />
          <Input type="password" label="Senha" />
          <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md w-full">Entrar</button>
        </form>

      </section>

    </main>
  );
}
