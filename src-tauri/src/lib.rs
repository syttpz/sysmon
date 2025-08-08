// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
//sysinfo CPU 使用率、内存使用情况、进程列表、磁盘使用、温度
//nvml-wrapper
use sysinfo::System;
use serde::Serialize;
use tauri::State;

 
#[derive(Serialize)]
pub struct StaticSysInfo{
    //静态数据，初次运行获取，如果已有文件，则存入文件，否则创建文件
    arch: String,
    cpu_brand: String,
    kernel_version: String,
    host_name: Option<String>,
    long_os_version: Option<String>,
    total_memory: u64,
}

#[derive(Serialize)]
pub struct DynamicSysInfo{
    //实时更新数据
    available_memory: u64,
    global_cpu_usage: f32,
    up_time: u64,
    used_memory: u64,
    cpu_usage: Vec<f32>,
}

#[tauri::command]
fn get_static_info() -> StaticSysInfo{
    let mut sys = System::new();
    //静态数据，初次运行获取，如果已有文件，则存入文件，否则创建文件
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
    // Wait a bit because CPU usage is based on diff.
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
    sys.refresh_all();
    StaticSysInfo{
        arch: System::cpu_arch(),
        cpu_brand: sys.cpus()[0].brand().to_string(),
        kernel_version: System::kernel_long_version(),
        host_name: System::host_name(),
        long_os_version: System::long_os_version(),
        total_memory: sys.total_memory(),
    }

}


#[tauri::command]
fn get_dynamic_info() -> DynamicSysInfo{
    let mut sys = System::new();

    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
    sys.refresh_all();
    // --- 实时更新数据 ---

    //基础数据
    /*
        s.available_memory() //free memory
        s.global_cpu_usage()
            s.refresh_cpu_usage()
        s.total_memory()
        s.uptime()
        s.used_memory() //ram
    */
    //

    //高级数据
    /*  
        cpu.cpu_usage() 12核cpu使用率
    */
    //12 核
    let mut usage = Vec::new();
    for cpu in sys.cpus(){
       usage.push(cpu.cpu_usage())
    }
    DynamicSysInfo{
        //实时更新数据
        available_memory: sys.available_memory(),
        global_cpu_usage: sys.global_cpu_usage(),
        up_time: System::uptime(),
        used_memory: sys.used_memory(),
        cpu_usage: usage,

    }
}

//register list of commands
pub fn run(){
    tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        get_static_info,
        get_dynamic_info
    ])
    .run(tauri::generate_context!())// Reads tauri config file
    .expect("Failed to run")
}
