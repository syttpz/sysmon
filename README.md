# SysMon.exe
![icon](./src-tauri/icons/64x64.png)

A lightweight Windows system monitor that displays device info, real-time CPU & memory, per-core usage, disk usage & I/O, and network info with private/public IPs.

## Preview
![Screenshot](./public/screenshots/overview.png)

## Installation
Download the latest `.exe` from [Releases](https://github.com/syttpz/sysmon/releases).  

## Dev setup

```bash
git clone https://github.com/syttpz/sysmon.git
cd sysmon
npm install   
npm run tauri dev 
```

## Build
```bash
cd src-tauri
npm build
```
