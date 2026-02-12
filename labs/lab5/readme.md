# Lab 5: Protecting Applications with the NGINXaaS Web Application Firewall (WAF)

## Overview
Welcome to **Lab 5**. In this module of **"Mastering cloud-native app delivery,"** we focus on protecting an application using the NGINX WAF. You will deploy the **NGINX WAF** and then run several layer-7 attacks, observing how the WAF protects the **OWASP Juice Shop** application.

---

## 🏗️ Pre-provisioned Infrastructure
The following resources are prepared for this lab:
* **Ubuntu VM:** Running OWASP Juice Shop in a Docker container on **Port 3000**.
* **Internal IP:** Your instructor will provide the private IP of the Juice Shop VM.

* You must have your Nginx for Azure instance running.
* Your Nginx for Azure instance must be running with the "plan:standardv3" SKU.
* You must have selected "Enable F5 WAF for NGINX" when creating the Nginx for Azure instance.

---
[include image from https://github.com/nginxinc/nginx-azure-workshops/blob/main/labs/lab9/media/lab9_diagram.png, but with minor changes to make it show WAF]
[include image from https://github.com/nginxinc/nginx-azure-workshops/raw/main/labs/lab9/media/nginx-cache-icon.png]

## 🚀 Lab Exercises

### Task 1: Test Application Vulnerabilities

Prior to configuring the WAF policy, run some common L7 HTTP vulnerability attacks and observe their effect.
   
  1. Open another tab in your browser (Chrome shown), navigate to the newly configured Load Balancer
     configuration: **http://juiceshop.example.com**, to confirm it is functional.
  
  2. Using some of the sample attacks below, add the URI path & variables to your application to generate
     security event data.
```
     * /?cmd=cat%20/etc/passwd
     * /product?id=4%20OR%201=1
     * /cart?search=aaa'><script>prompt('Please+enter+your+password');</script>
```

Observe the results (NEED DESCRIPTION OF WHAT STUDENT SHOULD EXPECT TO SEE)

#### Understanding NGINX WAF Configuration

F5 WAF for NGINX ships with two reference policies, both with a default enforcement mode set to Blocking:

- The **default** policy which is identical to the base template and provides OWASP Top 10 and Bot security protection out of the box.
- The **strict** policy contains more restrictive criteria for blocking traffic than the default policy. It is meant to be used for protecting sensitive applications that require more security but with higher risk of false positives.

For this lab, we will only implement the _default_ policy as this will be sufficient to show how the NGINX WAF can protect your application from the most common attacks.
If your environment requires more restrictive filters, the _strict_ policy may be a good solution.
However, in real-world production environments, these are merely starting points. Additional customizations can be performed according to the needs of the applications F5 WAF NGINX protects.

For a list of additional options that can be use to further customize your NGINX WAF policies, see the "Supported security policy features" and "Additional policy features" tables at https://docs.nginx.com/waf/policies/configuration/#supported-security-policy-features

### Task 2: Adding an NGINX WAF Policy

Create the Nginx for Azure configuration needed for the new WAF-protected version of juiceshop.example.com.

Using the Nginx for Azure Console, enable WAF by adding the following lines to /etc/nginx/conf.d/juiceshop.example.com.conf:
- "load_module modules/ngx_http_app_protect_module.so;" in the main context.
- "app_protect_enforcer_address 127.0.0.1:50000;" in the http context. (THIS CONTEXT WILL NEED TO BE ADDED FOR THIS LAB SECTION.)
- The following lines in the location context:
   - app_protect_enable on;
   - app_protect_policy_file "/etc/app_protect/conf/NginxDefaultPolicy.json";
   - app_protect_security_log_enable on;
   - app_protect_security_log "/etc/app_protect/conf/log_all.json" syslog:server=127.0.0.1:5140;


The juiceshop.example.com.conf file should now look like this:

(THIS CONFIG NEEDS CLEANUP)

    # Nginx 4 Azure - Juiceshop Nginx HTTP
    # WAF for Juiceshop

    # ADD THIS LINE TO LOAD WAF MODULE
    load_module modules/ngx_http_app_protect_module.so;

    # ADD THE ENFORCER ADDRESS BEFORE THE LOCATION BLOCK
    app_protect_enforcer_address 127.0.0.1:50000;

    server {
        
        listen 80;      # Listening on port 80 on all IP addresses on this machine

        server_name juiceshop.example.com;   # Set hostname to match in request
        status_zone juiceshop;

        # access_log  /var/log/nginx/juiceshop.log main;
        access_log  /var/log/nginx/juiceshop.example.com.log main_ext;
        error_log   /var/log/nginx/juiceshop.example.com_error.log info;

        # ADD THE ENFORCER ADDRESS BEFORE THE LOCATION BLOCK
        ## DOES THIS NEED TO BE PLACED IN THE HTTP CONTEXT?
        app_protect_enforcer_address 127.0.0.1:50000;

        location / {
            
            # return 200 "You have reached juiceshop server block, location /\n";

            # Set Rate Limit, uncomment below
            # limit_req zone=limit100;  #burst=110;       # Set  Limit and burst here
            # limit_req_status 429;           # Set HTTP Return Code, better than 503s
            # limit_req_dry_run on;           # Test the Rate limit, logged, but not enforced
            # add_header X-Ratelimit-Status $limit_req_status;   # Add a custom status header

            # NGINX WAF CONFIGURATION
            ## CAN THIS BE MOVED OUTSIDE OF THE LOCATION BLOCK SO IT APPLIES TO ALL PATHS?
            app_protect_enable on;
            app_protect_policy_file "/etc/app_protect/conf/NginxDefaultPolicy.json";
            app_protect_security_log_enable on;
            app_protect_security_log "/etc/app_protect/conf/log_all.json" syslog:server=127.0.0.1:5140;
            # END OF NGINX WAF CONFIGURATION

            proxy_pass http://aks1_ingress;       # Proxy to AKS1 Nginx Ingress Controllers
            add_header X-Proxy-Pass aks1_ingress_juiceshop;  # Custom Header

        }

        # Cache Proxy example for static images / page components
        # Match common files with Regex
        location ~* \.(?:ico|jpg|png)$ {
            
            ### Uncomment for new status_zone in dashboard
            status_zone images;

            proxy_cache image_cache;
            proxy_cache_valid 200 60s;
            proxy_cache_key $scheme$proxy_host$request_uri;

            # Override cache control headers
            proxy_ignore_headers X-Accel-Expires Expires Cache-Control Set-Cookie;
            expires 365d;
            add_header Cache-Control "public";

            # Add a Cache status header - MISS, HIT, EXPIRED
            
            add_header X-Cache-Status $upstream_cache_status;
            
            proxy_pass http://aks1_ingress;    # Proxy AND load balance to AKS1 NIC
            add_header X-Proxy-Pass nginxazure_imagecache;  # Custom Header

        }  

    }

The default policy enforces violations by Violation Rating, the F5 WAF for NGINX computed assessment of the risk of the request based on the triggered violations.

- 0: No violation
- 1-2: False positive
- 3: Needs examination
- 4-5: Threat

The default policy enables most of the violations and signature sets with Alarm turned ON, but not Block.

These violations and signatures, when detected in a request, affect the violation rating. By default, if the violation rating is calculated to be malicious (4-5) the request will be blocked by the VIOL_RATING_THREAT violation.

This is true even if the other violations and signatures detected in that request have the Block flag turned OFF. It is the VIOL_RATING_THREAT violation having the Block flag turned ON that caused the blocking, but indirectly the combination of all the other violations and signatures in Alarm caused the request to be blocked.

By default, other requests which have a lower violation rating are not blocked, except for some specific violations described below. This is to minimize false positives. However, you can change the default behavior.

For more information on configuring WAF capability in NGINX, see https://docs.nginx.com/waf/policies/configuration/
    
**Submit your Nginx Configuration.**

### Task 3: Test the Newly-added NGINX WAF Policy

Now, test out the newly-deployed default WAF policy.

  1. Open another tab in your browser (Chrome shown), navigate to the newly configured Load Balancer
     configuration: **http://juiceshop.example.com**, to confirm it is functional.
  
  2. Using some of the sample attacks below, add the URI path & variables to your application to generate
     security event data.
```
     * /?cmd=cat%20/etc/passwd
     * /product?id=4%20OR%201=1
     * /cart?search=aaa'><script>prompt('Please+enter+your+password');</script>
```

> Note:
>   *The web application firewall is blocking these requests to protect the application. The block page can*
>   *be customized to provide additional information.*

   ## Expected Results

  (Need to describe what students should expect to see and provide a screenshot.)
