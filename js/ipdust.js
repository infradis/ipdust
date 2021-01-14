let _app;
let ROOT_NETWORK;
let RATIO = 21;
let DEPTH_MAX = 4;
let LABEL_DEPTH_MAX = 3;
let THICKNESS = 0.15;
let squareDust;
let DUSTORDER = [0,1,2,3];	//Z |A0, B1|   U |A0 B3|  D |A0 B1|  C |A1 B0|
							//  |C2, D3|     |C1 D2|    |D3 C2|    |C2 D3|
let TOOLTIPSTYLE = new PIXI.TextStyle({
	fill: "black",
	fontSize: 16
})

let IP_DATA = []

class IPAddress {
	constructor (ipv4string) {
		if (!IPAddress.ValidateIPAddress(ipv4string)) return;
		
		this.ipv4string = ipv4string;
	}
	
	get toString() {
		return this.ipv4string;
	}
	
	get toArray() {
		return this.ipv4string.split('.');
	}
	
	get toIntArray() {
		let ipv4Array = this.ipv4string.split('.');
		for(let i = 0; i < ipv4Array.length; i++)
			ipv4Array[i] = +ipv4Array[i];
		
		return ipv4Array;
	}
	
	static ValidateIPAddress(ip) {
		if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip))
			return (true);
		else
			return (false);
		
	}
	
	static CalcNetwork(ip, mask) {

		let ipArray = ip.toArray;
		let maskArray = mask.toArray;
		let subnet = [];
		
		for(let i = 0; i < maskArray.length; i++)
			subnet.push(maskArray[i] & ipArray[i]);
		
		
		return new IPAddress(subnet.join('.'));
	}
	
	static NetMaskToBits(subnetMask) {
		let bits = 0;
		let ipv4array = subnetMask.toArray;
		
		for (let i = 0; i < 4; i++) {
			if (ipv4array[i] == 0) break;
			bits = bits + IPAddress.BitCount((ipv4array[i] >>> 0).toString(2)); 
		}

		return (bits);
	}
	
	static BitsToNetMask(bits) {

		let maskArray = [];
		
		// Push the 255
		let fullBytes = Math.floor(bits / 8);
		for (let i = 0; i < fullBytes; i++)
			maskArray.push(255);

		// Push any remainder bits != 0
		if ((bits % 8) != 0)
			maskArray.push(256 - (1 << (8 - (bits % 8))));
		
		// Push the 0
		for (let i = maskArray.length; i < 4; i++)
			maskArray.push(0);
		
		return new IPAddress(maskArray.join('.'));
		
	}
	
	static BitCount(n) {
		return n.toString(2).match(/1/g).length;
	}
	
	static dot2num(dot) {
		let d = dot.split('.');
		return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);		
	}
	
	static num2dot(num) {
		let d = num%256;
		for (let i = 3; i > 0; i--) 
		{ 
			num = Math.floor(num/256);
			d = num%256 + '.' + d;
		}
		return d;	
	}
}

class IPNetwork {
	
	constructor (network, mask) {
	  this.subnet = new IPAddress(network);
	  this.mask = new IPAddress(mask);
	  
	  this.bits = IPAddress.NetMaskToBits(this.mask);
	  
	  this.subnets = [];
	  
	  }

	get toString() {
		return (this.subnet.toString + '/' + this.bits);
	}
	
	GenerateSubnets()
	{
		let subnetBits = (this.bits == 32) ? 32 : this.bits + 2;
		if (this.bits > 32) return;
		
		let address = IPNetwork.GetSubnets(this.subnet, IPAddress.BitsToNetMask(this.bits), IPAddress.BitsToNetMask(subnetBits));
		
		for (let i = 0; i < address.length; i++)
			this.subnets.push(new IPNetwork(address[i].toString, IPAddress.BitsToNetMask(subnetBits).toString));
		
	}
	
	static GetSubnets(ipNetwork, networkMask, subnetMask) {
		let subnets = [];
		
		let networkBroadcast = IPNetwork.GetBroadcastAddress(ipNetwork, networkMask);
		let subnetBroadcast = IPNetwork.GetBroadcastAddress(ipNetwork, subnetMask);
		
		subnets.push(ipNetwork);
		
		while (networkBroadcast.toString != subnetBroadcast.toString) {
		  let subnet = IPNetwork.GetNextIPAddress(subnetBroadcast);
		  
		  subnets.push(subnet);
		  
		  subnetBroadcast = IPNetwork.GetBroadcastAddress(subnet, subnetMask);
			
		}
		
		return subnets;
		
	}
	
	static GetBroadcastAddress(ip, mask) {
		let ipArray = ip.toArray;
		let maskArray = mask.toArray;
		let subnetBroadcast = [];
	
		for(let i = 0; i < maskArray.length; i++) {
			let octIP = ipArray[i];
			let octMask = maskArray[i];
			
			let octBroadcast = ipArray[i] | maskArray[i]^255;
		
			subnetBroadcast.push(octBroadcast);
		}
		
		return new IPAddress(subnetBroadcast.join('.'));
	}
	
	static GetNextIPAddress (ip) {
		let ipArray = ip.toIntArray;
		
		for (let i = ipArray.length - 1; i >= 0; i--) {
			if (ipArray[i] + 1 > 255) { ipArray[i] = 0; continue; }
			ipArray[i] = ipArray[i] + 1;
			
			if (ipArray[i] != 0) break;
			
		}
		
		return new IPAddress(ipArray.join('.'));
		
	}
	
}

class SquareDust {
	constructor(x, y, width, ratio, depth, network, parent) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.ratio = ratio;
		this.length = (width / ratio) * ((ratio - 1) / 2);
		this.depth = depth;
		this.dust = new Graphics();

		this.network = network;
		this.parent = parent;
		
		this.childDust = [];
		
		this.GenerateSquareDust();
		
		if (this.depth < DEPTH_MAX)
			this.GenerateChildren();
		
	}
	
	GenerateChildren() {
		let x = this.x;
		let y = this.y;
		let width = this.width;
		let length = this.length;
		let ratio = this.ratio;
		let depth = this.depth;
		let network = this.network;

		network.GenerateSubnets();
		
		this.childDust[0] = new SquareDust(x, y, length, ratio, depth + 1, network.subnets[DUSTORDER[0]], this);
		this.childDust[1] = new SquareDust(x + (width - length), y, length, ratio, depth + 1, network.subnets[DUSTORDER[1]], this);
		this.childDust[2] = new SquareDust(x, y + (width - length), length, ratio, depth + 1, network.subnets[DUSTORDER[2]], this);
		this.childDust[3] = new SquareDust(x + (width - length), y + (width - length), length, ratio, depth + 1, network.subnets[DUSTORDER[3]], this);

	}


	// NEED A MAX DEPTH PER BITS i.e. /24 has a max depth of 4, /16 max depth of 8
	GenerateSquareDust() {
		
		let outsideScale = (this.depth == 0) ? 1.1 : 1.1 - Math.log(this.depth); //24 - (this.depth * 6);
		
		// Scale for printing inside a square
		let insideScale = (this.depth == 0) ? 1 : 1.75 - Math.log(this.depth);
		
		if (this.depth <= LABEL_DEPTH_MAX && this.depth < DEPTH_MAX) {
			this.NetworkLabel(this.network.toString, outsideScale);
			
		}
		
		// Only print dust when at max depth
		//   But, if commented out and 'this.depth == DEPTH_MAX' add to colorbit if statement,
		//		then parent objects will also be a rectange with an outline
		if (this.depth != DEPTH_MAX) return;

		// If the IP address exists, then set color and interactivety
		let colorBit = IP_DATA.includes(this.network.subnet.toString);

		// if (colorBit == true && this.depth == DEPTH_MAX) {
		if (colorBit == true) {

			this.dust.beginFill(0x566B30);
			this.dust.interactive = true;
			this.dust.buttonMode = true;

			// Drill into network, but maintain depth resolution
			this.dust.on('click', (event) => {
				
				// Boundary condition
				if (this.network.bits < 32) {
					BuildSquareDust(this.network);
				}

			});
			
			// Simply reset to ROOT_NETWORK.  Future to navigate back up the IP bit ranges
			//	  by Building the Square dust off of the parent network or parent of parent network, etc
			this.dust.on('rightclick', (event) => {
				BuildSquareDust(ROOT_NETWORK);
			});
			
		} else {
			this.dust.interactive = false;
			this.dust.lineStyle(THICKNESS, 0x000000, 1, 0);
		}
		
		this.dust.drawRect(this.x, this.y, this.width, this.width);
		this.dust.endFill();

		// added to the app.stage so that it is layered correctly
		this.dust.on('mouseover', (event) => {

			let labelNetwork = this.NetworkToolTip(this.network.toString);  //this.NetworkLabel(this.network.toString, insideScale);
			this.dust.message = labelNetwork;
			_app.stage.addChild(labelNetwork);

		})

		this.dust.on('mouseout', (event) => {
			_app.stage.removeChild(this.dust.message);
			delete this.dust.message;
		})

		
		_app.stage.addChild(this.dust);
		
		// Print inside dust 1 level deeper
		//if ((this.depth <= LABEL_DEPTH_MAX + 1))
		//	this.NetworkLabel(this.network.toString, insideScale);
			
	}

	// This is for the center labels that also changes depth resolution on click
	NetworkLabel(networkText, scale) {
	
		let labelLocationX = this.x + (this.width / 2);
		let labelLocationY = this.y + (this.width / 2);
		let labelNetwork = new PIXI.Text(networkText); //,{fontSize: scale});
		
		labelNetwork.anchor.x = 0.5;
		labelNetwork.anchor.y = 0.5;
		labelNetwork.scale.x *= scale;
		labelNetwork.scale.y *= scale;
		
		labelNetwork.x = labelLocationX;
		labelNetwork.y = labelLocationY;

		labelNetwork.interactive = true;
		labelNetwork.buttonMode = true;
		
		// Add click events to label
		labelNetwork.on('click', (event) => {
			// don't drill farther if the main block is /24 or more
			if (this.network.bits > 16 && DEPTH_MAX > 3) {
				// Do nothing
			} else {
				DEPTH_MAX++;
				BuildSquareDust(this.network);
			}
		})
		labelNetwork.on('rightclick', (event) => {
			DEPTH_MAX--;
			BuildSquareDust(this.network);
		})
		
		_app.stage.addChild(labelNetwork);
	
	}

	NetworkToolTip(networkText) {
		let tooltipLocationX = this.x + (this.width / 2);
		let tooltipLocationY = this.y + (this.width / 2);
		
		let tooltipNetwork = new PIXI.Text(networkText, TOOLTIPSTYLE);  //, TOOLTIPSTYLE);
		
		//tooltipNetwork.anchor.x = 1;
		//tooltipNetwork.anchor.y = 1;

		tooltipNetwork.x = tooltipLocationX;
		tooltipNetwork.y = tooltipLocationY - tooltipNetwork.height;
		

		var textBackground = new Graphics();
		textBackground.beginFill(0xEFEFEF);
		textBackground.lineStyle(THICKNESS, 0x000000, 1, 0);
		textBackground.drawRect(tooltipLocationX, tooltipLocationY - tooltipNetwork.height, tooltipNetwork.width, tooltipNetwork.height);
		//textBackground.drawRect(tooltipLocationX - tooltipNetwork.width, tooltipLocationY - tooltipNetwork.height, tooltipNetwork.width, tooltipNetwork.height);
		textBackground.endFill();

		textBackground.addChild(tooltipNetwork);

		return textBackground;

	}


	static Depth() {
		let locationX = 5; //(app.renderer.view.height / 2);
		let locationY = (app.renderer.view.width / 2);
		
		let addresses = Math.pow(4, DEPTH_MAX);
		
		let textDepth = new PIXI.Text('D:' + DEPTH_MAX + ' A:' + addresses);
		
		//textDepth.anchor.x = 0.5;
		textDepth.anchor.y = 0.5;
		textDepth.x = locationX;
		textDepth.y = locationY;
		
		_app.stage.addChild(textDepth);
		
	}
	
}

//Parent is NULL, probably should be assigned for Building Square after a right or left click
function BuildSquareDust(ipNetwork) {
	_app.stage.removeChildren();

	squareDust = new SquareDust(0, 0, app.renderer.view.width, RATIO, 0, ipNetwork, null);
	
	SquareDust.Depth();
	
}

function GetIPData() {
	var request = new XMLHttpRequest();
	request.open('GET', '../data/172.0.0.0.txt',false);
	request.send();
	var ipTextData = request.responseText;

	IP_DATA = ipTextData.split('\r\n');

	ipTextData = "";
	request = null;

}

function Initialize(a, rootNetwork) {

	_app = a;
	ROOT_NETWORK = rootNetwork;

	GetIPData();
	
	BuildSquareDust(ROOT_NETWORK);

}
