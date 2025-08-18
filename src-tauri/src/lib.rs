//sysinfo CPU 使用率、内存使用情况、进程列表、磁盘使用、温度


use sysinfo::{System, Product, Disks};
use serde::Serialize;

use std::sync::Mutex;
use once_cell::sync::Lazy;

 //静态数据，初次运行获取
    //基础数据
    /*
        System::cpu_arc() //系统架构
        cpu.brand()  //可以爬虫到intel网站
        System::kernel_long_version //内核版本
        System::host_name() //主机名
        System::long_os_version() //版本，专业版，普通版，等等。
    */

    //高级数据
    /*
        //p_core e_core
            p_core频率 > e_core 
            Heterogeneous MultiCore
            Symmetric MultiCore
    */
 


#[derive(Serialize)]
pub struct StaticSys{
    name: Option<String>,
    arch: String,
    cpu_brand: String,
    kernel_version: String,
    host_name: Option<String>,
    long_os_version: Option<String>,
    total_memory: u64,
    total_space: Vec<u64>,
    serial_num: Option<String>, 
    vendor: Option<String>, 
}

#[derive(Serialize)]
pub struct CpuMem{
    available_memory: u64,
    global_cpu_usage: f32,
    up_time: u64,
    used_memory: u64,
    cpu_usage: Vec<f32>,
    cpu_frequency: Vec<u64>,
    cpu_brand: Vec<String>,
}

#[derive(Serialize)]
pub struct DiskEntry {
    mount_point: String,
    file_system: String,
    total_space: u64,
    available_space: u64,
}

#[derive(Serialize)]
pub struct LocalIp{
    ipv4: Option<String>,
    ipv6: Option<String>,
}

static SYS: Lazy<Mutex<System>> = Lazy::new(|| {
    let mut sys = System::new();
    sys.refresh_all();
    Mutex::new(sys)
});


#[tauri::command]
fn get_static_info() -> StaticSys{
    let mut sys = SYS.lock().unwrap();
    let disks = Disks::new_with_refreshed_list();

    // Sysinfo - Wait a bit because CPU usage is based on diff.
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
    sys.refresh_all();

    let mut space = Vec::new();
    for disk in disks.list(){
        space.push(disk.total_space());
    }

    StaticSys{
        name: Product::name(),
        arch: System::cpu_arch(),
        cpu_brand: sys.cpus()[0].brand().to_string(),
        kernel_version: System::kernel_long_version(),
        host_name: System::host_name(),
        long_os_version: System::long_os_version(),
        total_memory: sys.total_memory(),
        total_space: space,
        serial_num: Product::serial_number(),
        vendor: Product::vendor_name()
    }

}


//https://learn.microsoft.com/en-us/windows/win32/api/sysinfoapi/nf-sysinfoapi-getlogicalprocessorinformationex
#[tauri::command]
fn get_cpu_mem_info() -> CpuMem{
    let mut sys = SYS.lock().unwrap();

    sys.refresh_cpu_all(); 
    sys.refresh_memory(); 

    let mut usage = Vec::new();
    let mut freq = Vec::new();
    let mut brand = Vec::new();
    //let mut ep_core = Vec::new();
    for cpu in sys.cpus(){
       usage.push(cpu.cpu_usage());
       freq.push(cpu.frequency());
       brand.push(cpu.brand().to_string());
    }

    CpuMem{
        available_memory: sys.available_memory(),
        global_cpu_usage: sys.global_cpu_usage(),
        up_time: System::uptime(),
        used_memory: sys.used_memory(),
        cpu_usage: usage,
        cpu_frequency: freq,
        cpu_brand: brand,
    }
}

#[tauri::command]
fn get_disk_info() -> Vec<DiskEntry> {
    let disks = Disks::new_with_refreshed_list();
    let mut entry = Vec::new();

    for d in disks.list() {
        entry.push(DiskEntry {
            mount_point: d.mount_point().to_string_lossy().into_owned(),
            file_system: d.file_system().to_string_lossy().into_owned(),
            total_space: d.total_space(),
            available_space: d.available_space(),
        });
    }
    entry
}

#[tauri::command]
fn get_local_ip() -> Result<LocalIp, String> {
    let ip = local_ip_address::local_ip().map_err(|e| e.to_string())?;
    let mut out = LocalIp { ipv4: None, ipv6: None };
    match ip {
        std::net::IpAddr::V4(v4) => out.ipv4 = Some(v4.to_string()),
        std::net::IpAddr::V6(v6) => out.ipv6 = Some(v6.to_string()),
    }
    Ok(out)
}

//https://tauri.app/develop/calling-rust/
pub fn run(){
    tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        get_static_info,
        get_cpu_mem_info,
        get_disk_info,
        get_local_ip
    ])
    .run(tauri::generate_context!())// Reads tauri config file
    .expect("Failed to run")
}
