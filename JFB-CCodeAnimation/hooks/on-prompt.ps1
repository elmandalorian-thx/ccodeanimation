# Called when user submits a prompt
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
node "$projectDir/src/send-event.js" prompt
