@echo off
set FORM=%1
set TO=%2

for /L %%A IN (%FORM%,1,%TO%) DO (
  start /B run_job.bat %%A
)

:theend
