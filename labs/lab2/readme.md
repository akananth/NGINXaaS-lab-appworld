# Lab 2: Advanced Traffic Management with NGINX for Azure

## Overview
Welcome to **Lab 2**. In this session of **"Mastering cloud-native app delivery: Unlocking advanced capabilities and use cases with F5’s ADCaaS,"** we move beyond basic connectivity to functional load balancing. 

In this module, you will configure your NGINX for Azure instance to route traffic to a backend application running on a pre-provisioned Linux workload.

---

## 🏗️ Pre-provisioned Infrastructure
To focus specifically on NGINX configuration, the following backend resources have been pre-deployed for you:

* **Ubuntu VM:** A Linux virtual machine running a Dockerized "Hello World" application.
* **Internal IP:** Your instructor will provide the internal IP of your Ubuntu VM (e.g., `10.1.2.4`).

---

## 🚀 Lab Exercises

### Configure NGINX for Azure to Load Balance Docker Containers

In this section, we will configure NGINX for Azure to load balance traffic to the Docker container running on your Ubuntu VM.



1.  Browse to your **NGINX for Azure** deployment in the Azure Portal.
2.  Under **Settings**, select **NGINX configuration**.
3.  Select **Edit** to modify the configuration.
4.  **Update the main config:** Replace the existing configuration in `/etc/nginx/nginx.conf` with the following block to enable modular configuration:

```nginx
user nginx;
worker_processes auto;
worker_rlimit_nofile 8192;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;

    # Task: Include modular configuration files
    include /etc/nginx/conf.d/*.conf;
}


Create the modular config file: Click the + New File button in the Configuration Editor tool.

Name the new file: /etc/nginx/conf.d/cafe.example.com.conf.

Add the Upstream and Server blocks: Copy and paste the following contents into the editor for the new file.

Note: Replace [VM_INTERNAL_IP] with the private IP of your pre-provisioned Ubuntu VM.

upstream docker_backend {
    # Replace [VM_INTERNAL_IP] with the private IP of your Ubuntu VM
    server [VM_INTERNAL_IP]:80;
}

server {
    listen 80;
    server_name cafe.example.com;

    location / {
        proxy_pass http://docker_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

1. Open Azure portal within your browser and then open your Resource Group. Click on your NGINX for Azure resource (nginx4a) which should open the Overview section of your resource. From the left pane click on `NGINX Configuration` under Settings.

1. Click on `+ New File`, to create a new Nginx config file. Name the new file `/etc/nginx/conf.d/cafe-docker-upstreams.conf`.

    **Important:** You must use the full Linux /directory/filename path for every Nginx config file, for it to be properly created and placed in the correct directory.  If you forget, you can delete it and must re-create it.  The Azure Portal Text Edit panels do not let you move, or drag-n-drop files or directories.  You can `rename` a file by clicking the Pencil icon, and `delete` a file by clicking the Trashcan icon at the top.

1. Copy and paste the contents from the matching file present in `lab2` directory from Github, into the Configuration Edit window, shown here:

    ```nginx
    # Nginx 4 Azure, Cafe Nginx Demo Upstreams
    # Chris Akker, Shouvik Dutta, Adam Currier - Mar 2024
    #
    # cafe-nginx servers
    #
    upstream cafe_nginx {
        zone cafe_nginx 256k;
        
        # from docker compose
        server n4a-ubuntuvm:81;
        server n4a-ubuntuvm:82;
        server n4a-ubuntuvm:83;

        keepalive 32;

    }
    ```

    ![N4A Config Edit](media/lab2_cafe-docker-upstreams.png)

    This creates an Nginx Upstream Block, which defines the backend server group that Nginx will load balance traffic to.

    Click `Submit` to save your Nginx configuration.

1. Click the `+ New File` again, and create a second Nginx config file, using the same Nginx for Azure Configuration editor tool. Name the second file `/etc/nginx/conf.d/cafe.example.com.conf`.

1. Copy and paste the contents of the matching file present in `lab2` directory from Github, into the Configuration Edit window, shown here:

    ```nginx
    # Nginx 4 Azure - Cafe Nginx HTTP
    # Chris Akker, Shouvik Dutta, Adam Currier - Mar 2024
    #
    server {
        
        listen 80;      # Listening on port 80 on all IP addresses on this machine

        server_name cafe.example.com;   # Set hostname to match in request
        status_zone cafe.example.com;   # Metrics zone name

        access_log  /var/log/nginx/cafe.example.com.log main;
        error_log   /var/log/nginx/cafe.example.com_error.log info;

        location / {
            #
            # return 200 "You have reached cafe.example.com, location /\n";
            
            proxy_pass http://cafe_nginx;        # Proxy AND load balance to a list of servers
            add_header X-Proxy-Pass cafe_nginx;  # Custom Header

            # proxy_pass http://windowsvm;        # Proxy AND load balance to a list of servers
            # add_header X-Proxy-Pass windowsvm;  # Custom Header

        }

    }

    ```

    Click `Submit` to save your Nginx configuration.

1. Now you need to include these new files into your main `nginx.conf` file within your `nginx4a` resource. Copy and paste the contents of the `nginx.conf` file present in `lab2` directory from Github, into the `nginx.conf` file using Configuration Edit window, shown here:

    ```nginx
    # Nginx 4 Azure - Default - Updated Nginx.conf
    # Chris Akker, Shouvik Dutta, Adam Currier - Mar 2024
    #
    user nginx;
    worker_processes auto;
    worker_rlimit_nofile 8192;
    pid /run/nginx/nginx.pid;

    events {
        worker_connections 4000;
    }

    error_log /var/log/nginx/error.log error;

    http {
        log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
                      
        access_log off;
        server_tokens "";
        server {
            listen 80 default_server;
            server_name localhost;
            location / {
                # Points to a directory with a basic html index file with
                # a "Welcome to NGINX as a Service for Azure!" page
                root /var/www;
                index index.html;
            }
        }

        include /etc/nginx/conf.d/*.conf;
        # include /etc/nginx/includes/*.conf;    # shared files
    
    }

    # stream {
        
    #     include /etc/nginx/stream/*.conf;          # Stream TCP nginx files

    # }
    ```

    Notice that the Nginx standard / Best Practice of placing the HTTP Context config files in the `/etc/nginx/conf.d` folder is being followed, and the `include` directive is being used to read these files at Nginx configuration load time.

1. Click the `Submit` Button above the Editor.  Nginx will validate your configurations, and if successful, will reload Nginx with your new configurations.  If you receive an error, you will need to fix it before you proceed.

<br/>

### Test your Nginx for Azure configuration

1. For easy access your new website, update your local system's DNS `/etc/hosts` file. You will add the hostname `cafe.example.com` and the Nginx for Azure Public IP address, to your local system DNS hosts file for name resolution.  Your Nginx for Azure Public IP address can be found in your Azure Portal, under `n4a-publicIP`.  Use vi tool or any other text editor to add an entry to `/etc/hosts` as shown below:

    ```bash
    cat /etc/hosts

    127.0.0.1 localhost
    ...

    # Nginx for Azure testing
    11.22.33.44 cafe.example.com

    ...
    ```

    where
   - `11.22.33.44` replace with your `n4a-publicIP` resource IP address.

1. Once you have updated the host your /etc/hosts file, save it and quit vi tool.

1. Using a new Terminal, send a curl command to `http://cafe.example.com`, what do you see ?

    ```bash
    curl -I http://cafe.example.com
    ```

    ```bash
    ##Sample Output##
    HTTP/1.1 200 OK
    Date: Thu, 04 Apr 2024 21:36:30 GMT
    Content-Type: text/html; charset=utf-8
    Connection: keep-alive
    Expires: Thu, 04 Apr 2024 21:36:29 GMT
    Cache-Control: no-cache
    X-Proxy-Pass: cafe_nginx
    ```

    Try the coffee and tea URLs, at http://cafe.example.com/coffee and http://cafe.example.com/tea.

    You should see a 200 OK Response.  Did you see the `X-Proxy-Pass` header - set to the Upstream block name?  

1. Now try access to your cafe application with a Browser. Open Chrome, and nagivate to `http://cafe.example.com`. You should see an `Out of Stock` image, with a gray metadata panel, filled with names, IP addresses, URLs, etc. This panel comes from the Docker container, using Nginx $variables to populate the gray panel fields. If you Right+Click, and Inspect to open Chrome Developer Tools, and look at the Response Headers, you should be able to see the `Server and X-Proxy-Pass Headers` set respectively.

![Cafe Out of Stock](media/lab2_cafe-out-of-stock.png)

Click Refresh serveral times.  You will notice the `Server Name` and `Server Ip` fields changing, as N4A is round-robin load balancing the three Docker containers - docker-web1, 2, and 3 respectively.  If you open Chrome Developer Tools, and look at the Response Headers, you should be able to see the Server and X-Proxy-Pass Headers set respectively.

![Cafe Inspect](media/lab2_cafe-inspect.png)

Try http://cafe.example.com/coffee and http://cafe.example.com/tea in Chrome, refreshing several times.  You should find Nginx for Azure is load balancing these Docker web containers as expected.

>**Congratulations!!**  You have just completed launching a simple web application with Nginx for Azure, running on the Internet, with just a VM, Docker, and 2 config files for Nginx for Azure.  That pretty easy, not so hard now, was it?

<br/>

