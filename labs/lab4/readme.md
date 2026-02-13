# Lab 4: Protecting Applications with Rate Limiting

## Overview
Welcome to **Lab 4**. In this module of **"Mastering cloud-native app delivery,"** we focus on application resilience. You will protect the **OWASP Juice Shop** application from brute-force attempts and DoS-like traffic patterns by implementing **NGINX Rate Limiting**.

---

## 🏗️ Pre-provisioned Infrastructure
The following resources are prepared for this lab:
* **Ubuntu VM:** Running OWASP Juice Shop in a Docker container on **Port 3000**.
* **Internal IP:** Your instructor will provide the private IP of the Juice Shop VM.

---

## 🚀 Lab Exercises

### Task 1: Create the Rate Limit Zones
Instead of cluttering the main configuration, we will create a dedicated file for our limit definitions.

1. In the Azure Portal, go to your NGINX for Azure resource.

2. Select NGINX configuration -> Edit.

3. Click + New File and name it: /etc/nginx/includes/rate-limits.conf.

4. Copy and paste the following  standard definitions:

```nginx
## Define HTTP Request Limit Zones
limit_req_zone $binary_remote_addr zone=limitone:10m rate=1r/s;
limit_req_zone $binary_remote_addr zone=limit10:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=limit100:10m rate=100r/s;
limit_req_zone $binary_remote_addr zone=limit1000:10m rate=1000r/s;
```

### Task 2: Include and Apply the Limits

Now, we must tell NGINX to load these zones and apply the limitone (1 request per second) policy to Juice Shop.

1. Open /etc/nginx/nginx.conf.

2. Inside the http {} block, add the include line before your server blocks:

```nginx
   include /etc/nginx/includes/rate-limits.conf;
```
3. Click Submit.

5. Now, open /etc/nginx/conf.d/juiceshop.conf and apply the limit to the location block:
   
```nginx
upstream juiceshop_backend {
    server [VM_INTERNAL_IP]:3000;
}

server {
    listen 80;
    server_name juiceshop.example.com;
    # ADD THIS for Azure Portal Metrics visibility
    status_zone juiceshop.example.com; 
    access_log  /var/log/nginx/juiceshop.example.com.log main_ext;   # Extended Logging
    error_log   /var/log/nginx/juiceshop.example.com_error.log info;

    location / {
       # Apply the 'limitone' zone defined in Task 1
        limit_req zone=limitone burst=3 nodelay;
        proxy_pass http://juiceshop_backend;
        proxy_set_header Host $host;
    }
}
```
6. Click Submit.

### Task 3: Test the Rate Limit

 1. To see the rate limiting in action, we need to send requests faster than 1 per second.

 2. Open a terminal on your local machine.
 
 3. Like before, update your local system's DNS `/etc/hosts` file. This time, you will add the hostname `juiceshop.example.com` after your previous update (`cafe.example.com`), as shown below:

    ```bash
    cat /etc/hosts

    127.0.0.1 localhost
    ...

    # Nginx for Azure testing
    11.22.33.44 cafe.example.com
    11.22.33.44 juiceshop.example.com

    ...
    ```

    where
   - `11.22.33.44` replace with your `n4a-publicIP` resource IP address.

 4. Once you have updated the host your /etc/hosts file, save it and quit vi tool.
 
 5. Run a loop to hit the site rapidly:

```bash
  for i in {1..10}; do curl -I http://juiceshop.example.com; done
```

6. Observe the results: You should see several 200 OK responses followed by 503 Service Temporarily Unavailable (or 429 Too Many Requests depending on NGINX version/config) as the rate limit kicks in.

### Task 4: Verify via Log Analytics

 1. Navigate to your Log Analytics Workspace.

 2. Run the following query to see the rejected requests:

```
NGXOperationLogs
| where FilePath == "/var/log/nginx/access.log"
| where Message contains "503"
| summarize Count = count() by bin(TimeGenerated, 1m)
| render barchart with (title="Lab 4: Blocked Requests (503) per Minute")
```

Congratulations on completing Lab 4!
