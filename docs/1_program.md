# Program

## constructor(options)

input
output
log `<string>` path
dump
zero
useBuffer
tput  `<boolean>`

## public member

options
input
output
zero
useBuffer

x `<number>`
y `<number>`
savedX `<number>`
savedY `<number>`
cols `<number>`
rows `<number>`
scrollTop `<number>`
scrollBottom `<number>`

isOSXTerm `<boolean>`
isiTerm2 `<boolean>`
isXFCE `<boolean>`
isTerminator `<boolean>`
isLXDE `<boolean>`
isVTE `<boolean>`
isRxvt `<boolean>`
isXterm `<boolean>`
tmux  `<boolean>`
tmuxVersion `<number>`

index `<number>` index of Program.instances
type `<string>` 'program'

## private memner

_logger
_terminal `<string>`
_buf `<string>`
_flush `<funciton>`
_exiting `<boolean>`