# Lab 2: Advanced Traffic Management with NGINX for Azure

## Overview
Welcome to **Lab 2**. In this session of **"Mastering cloud-native app delivery: Unlocking advanced capabilities and use cases with F5’s ADCaaS,"** we move beyond basic connectivity to functional load balancing. 

In this module, you will configure your NGINX for Azure instance to route traffic to a backend application running on a pre-provisioned Linux workload using the Azure Portal.

---

## 🏗️ Pre-provisioned Infrastructure
To focus specifically on NGINX configuration, the following backend resources have been pre-deployed for you:

* **Ubuntu VM:** A Linux virtual machine running a Dockerized "Cafe" application.
* **Internal IP:** Your instructor will provide the internal IP of your Ubuntu VM (e.g., `n4a-ubuntuvm`).

---

## 🚀 Lab Exercises

### Configure NGINX for Azure to Load Balance Docker Containers

In this section, we will configure NGINX for Azure to load balance traffic to the Docker containers running on your Ubuntu VM.



#### 1. Access the Configuration Editor
1. Open the **Azure Portal** and navigate to your **Resource Group**. 
2. Click on your NGINX for Azure resource (usually named **nginx4a**), which will open the Overview section. 
3. From the left pane, click on **NGINX Configuration** under the Settings section.

#### 2. Create the Upstream Configuration
 1. Click on **+ New File** to create a new NGINX config file. 
 2. Name the new file: `/etc/nginx/conf.d/cafe-docker-upstreams.conf`.
   > **Important:** You must use the full Linux `/directory/filename` path for every config file. The Azure Portal does not support drag-and-drop.
 3. Copy and paste the following contents into the editor:

```nginx
# Nginx 4 Azure, Cafe Nginx Demo Upstreams
# cafe-nginx servers
#
upstream cafe_nginx {
    zone cafe_nginx 256k;
    
    # These correspond to the ports exposed by the Docker containers
    server n4a-ubuntuvm:81;
    server n4a-ubuntuvm:82;
    server n4a-ubuntuvm:83;

    keepalive 32;
}
```
 4. Click Submit to save this part of the configuration.

#### 3. Create the Virtual Server Configuration

  1. Click + New File again.

  2. Name the second file: /etc/nginx/conf.d/cafe.example.com.conf.

  3. Copy and paste the following contents into the editor:

  ```nginx 
   # Nginx 4 Azure - Cafe Nginx HTTP
server {
    
    listen 80;      # Listening on port 80

    server_name cafe.example.com;   # Set hostname to match in request
    status_zone cafe.example.com;   # Metrics zone name

    access_log  /var/log/nginx/cafe.example.com.log main;
    error_log   /var/log/nginx/cafe.example.com_error.log info;

    location / {
        proxy_pass http://cafe_nginx;        # Proxy and load balance to the upstream group
        add_header X-Proxy-Pass cafe_nginx;  # Custom verification header
    }
}
```

 4. Click Submit to save.

#### 4. Update the Main NGINX Configuration
1. You must now include these new files into your main nginx.conf.

2. Select the nginx.conf file in the editor file tree.

3. Replace the existing content with the following:

```nginx 
   # Nginx 4 Azure - Default - Updated Nginx.conf
user nginx;
worker_processes auto;
worker_rlimit_nofile 8192;
pid /run/nginx/nginx.pid;

events {
    worker_connections 4000;
}

error_log /var/log/nginx/error.log error;

http {
    include /etc/nginx/mime.types;
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
                      
    access_log off;
    server_tokens "";
    
    server {
        listen 80 default_server;
        server_name localhost;
        location / {
            root /var/www;
            index index.html;
        }
    }

    # Load the modular files created in previous steps
    include /etc/nginx/conf.d/*.conf;
}
```
3.  Click the Submit button. NGINX will validate your configuration. If successful, it will reload with your new settings.

#### Test and Verify

1. Update Local DNS
 
 Update your local system's hosts file to resolve cafe.example.com to your NGINX Public IP.

  File Path: /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)

Entry: [NGINX_PUBLIC_IP] cafe.example.com

2. Verify via CLI
Run the following command in a terminal:

'''curl -I [http://cafe.example.com](http://cafe.example.com)'''
