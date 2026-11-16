param(
    [Parameter(Mandatory = $true)][string]$Json,
    [Parameter(Mandatory = $true)][string]$OutDir,
    [int]$Rate = 0
)
# Gera um WAV por fala com a voz pt-BR instalada no Windows (Microsoft Maria Desktop, offline).
Add-Type -AssemblyName System.Speech
$items = Get-Content -Raw -Encoding UTF8 -LiteralPath $Json | ConvertFrom-Json
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice("Microsoft Maria Desktop")
$synth.Rate = $Rate
$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
foreach ($item in $items.PSObject.Properties) {
    $file = Join-Path $OutDir ($item.Name + ".wav")
    $synth.SetOutputToWaveFile($file, $format)
    $synth.Speak([string]$item.Value)
    $synth.SetOutputToNull()
}
$synth.Dispose()
