# IPDust Overview
IPv4 addressing space organized in a fractal based visualization construct.  Leverages a form of IP Cantor dust for organizational layout.  See Gallery for images.  
  
One simple use case to visualize the usage and organization of an enterprise addressing. Often with years of network implementations, enterprise IP addressing is poorly organized with minimal usage taking up large addressing block. For example that one DNS server left on a subnet, but moving it would cause a hug logistical challenge. Thus, an entire /24 is wasted because of a single, critical server.  
  
There are really 3 states represented in a square dust, or rather could be represented in a more productionalized version.  Green square dust = online/healthy/reserved, Red square dust (not shown) = offline/unhealthy, Blank square dust = offline/available.  

# Dataset
IP addressing dataset contains **1,144,066** 172.0.0.0/8 ipv4 addresses to demonstrate organization and visual patterns.  


# Usage
Add ipdust to local repository.  Run python -m http.server from directory at command line, or whatever http server preference.  Open browser to index.html.  
  
# Navigation
Navigating through the addressing space:  
**Left-clicking** center text of IP Network, such as "172.0.0.0/8"  increases the addressing depth, i.e. how many address/networks are displayed.  Please note that at a depth of 6 and above, it takes a while to display.  Of course improvements in efficiency could certainly be made.  
**Right-clicking** center text of IP Network, reduces the addressing depth.  
  
**Left-clicking** any of the green squares results in changing the network address space represented, such as change from 172.0.0.0/8 to 172.52.0.0/16 (see image 10__172.0.0.0-8_172.52.0.0-16.png).  
**Right-clicking** any green square results in resetting back to the default 172.0.0.0/8 with a Depth of 3.

# Gallery
Contains images of each IP addressing depth and related number of addresses visualized.  D0 is the single square to show the root of a 172.0.0.0/8 address.  D1 to D8 then shows the exponential increase in granuality of the addressing space when click on the center 172.0.0.0/8 text.  D stands for Depth.   

172.0.0.0/8 network visualization  
D1 = 4 /10 networks     - 01__172.0.0.0-8-D1.png  
D2 = 16 /12 networks    - 02__172.0.0.0-8-D2.png  
D3 = 64 /14 networks    - 03__172.0.0.0-8-D3.png  
D4 = 256 /16 networks   - 04__172.0.0.0-8-D4.png  
D5 = 1024 /18 networks  - 05__172.0.0.0-8-D5.png  
D6 = 4,096 /20 networks - 06__172.0.0.0-8-D6.png  
D7 = 16,384 /22 networks - 07__172.0.0.0-8-D7.png  
D8 = 65,536 /24 networks - 08__172.0.0.0-8-D8.png  
  
172.52.0.0/16 network visualization down to /32 addresses  
D1 = 4 /18 networks       - 11_172.52.0.0-16-D1.png  
D2 = 16 /20 networks      - 12_172.52.0.0-16-D2.png  
D3 = 64 /22 networks      - 13_172.52.0.0-16-D3.png  
D4 = 256 /24 networks     - 14_172.52.0.0-16-D4.png  
D5 = 1024 /26 networks    - 15_172.52.0.0-16-D5.png  
D6 = 4,096 /28 networks   - 16_172.52.0.0-16-D6.png  
D7 = 16,384 /30 networks  - 17_172.52.0.0-16-D7.png  
D8 = 65,536 /32 addresses - 18_172.52.0.0-16-D8.png  
