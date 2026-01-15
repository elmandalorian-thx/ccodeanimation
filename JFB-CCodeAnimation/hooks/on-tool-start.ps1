# Called when a tool starts
param($tool)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$data = @{tool=$tool} | ConvertTo-Json -Compress
node "$projectDir/src/send-event.js" tool_start $data
