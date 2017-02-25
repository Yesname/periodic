function Periodic(svg){
	this.svg = svg;
	this.ns = 'http://www.w3.org/2000/svg';
	this.elements = getElements();
	this.mode = 'full';
	this.scheme = 'groups';
	this.ratio = 1.4;
	this.gaps = 0;

	this.setSizes(32,7);

	this.colorFaded = [240,240,250];
	this.colorsDefault = [[114,140,52],[68,115,172],[77,100,128],[103,84,142],[131,73,148],[145,150,159],[79,89,101],[63,104,93],[73,120,65],[181,124,43],[205,100,43]];
	//this.mapRadioactivity = [[247,246,163,1],[249,157,80,1],[199,75,51,1],[103,48,43,1],[28,28,32,1]];
	this.mapRadioactivity = [[156,218,36],[32,64,96],[18,20,22]];
	this.mapAbu = [[68,28,62,1],[103,42,73,1],[199,71,55,1],[249,157,80,1],[246,237,223,1]];
	this.mapWeight = [[251,238,193,1],[141,89,46,1],[79,0,15,1]];
	this.mapMelt = [[233,237,246,1],[170,207,249,1],[101,125,199,1],[83,72,103,1],[62,38,78,1],[48,48,72,1],[103,48,43,1],[199,75,51,1],[249,157,80,1],[247,246,163,1]];
	this.mapBoil = [[233,237,246,1],[170,207,249,1],[101,125,199,1],[83,72,103,1],[62,38,78,1],[48,48,72,1],[103,48,43,1],[199,75,51,1],[249,157,80,1],[247,246,163,1],[247,246,255,1]];
	this.mapElneg = [[84,75,153],[211,65,102],[253,181,87]];
	this.stuff = [];

	this.g = document.createElementNS(this.ns,'g');
	
	this.header = document.createElementNS(this.ns,'text');
	this.header.innerHTML = 'Таблица элементов';
	this.header.style.fill = 'rgb(0,0,0)';
	this.header.style.fontFamily = 'LatoWebBold';
	this.header.style.fontWeight = 400;
	this.header.setAttribute('text-anchor', 'middle');
	this.header.setAttribute('dominant-baseline', 'baseline');
	this.header.style.fontSize = this.cellWidth * .8 + 'px';
	this.header.setAttribute('x', this.width * .5);
	this.header.setAttribute('y', this.height * .16);

	this.g.appendChild(this.header);
	this.svg.appendChild(this.g);

	for (let i = 0; i < this.elements.length; i++){
		this.stuff.push(new Element(this,i));
	}
	//this.stuff.push(new Element(this, 42));
}
Periodic.prototype.setSizes = function(columns, rows){
	this.width = this.svg.clientWidth || document.body.offsetWidth;
	this.height = this.svg.clientHeight || document.body.offsetHeight;
	this.cellWidth = this.width / 32 - this.gaps * 31 / 32;
	this.cellHeight = this.cellWidth * this.ratio;
	this.scaleDownRatio = this.height / (this.cellHeight * 12 + this.gaps * 11);
	if (this.scaleDownRatio < 1){
		this.cellWidth *= this.scaleDownRatio;
		this.cellHeight = this.cellWidth * this.ratio;
	}
	//this.width = this.svg.clientWidth || document.body.offsetWidth;
	//this.height = this.svg.clientHeight || document.body.offsetHeight;
	this.xPadding = (this.width - (this.cellWidth * columns + this.gaps * (columns - 1))) * .5;
	this.yPadding = this.height - (this.cellHeight * rows + this.gaps * (rows-1));
	this.center = {
		x: this.width / 2,
		y: (this.height + this.yPadding) / 2
	}
}
Periodic.prototype.update = function(mode){
	if (mode) this.mode = mode;
	if (this.mode === 'minimal') {
		this.setSizes(18,10);
	} else if (this.mode === 'full'){
		this.setSizes(32,7);
	} else if (this.mode === 'list'){
		this.setSizes(20,8);
	}

	alive.animate(this.header, 'font-size', this.cellWidth * .8 + 'px', 500);
	alive.animate(this.header, 'x', this.width * .5, 500, 'soft');
	alive.animate(this.header, 'y', this.height * .16, 500, 'soft');

	for (let i = 0; i < this.stuff.length; i++){
		this.stuff[i].update(this.mode);
	}
}
Periodic.prototype.repaint = function(scheme,isDark){
	this.scheme = scheme;
	if (scheme == 'groups'){
		this.header.innerHTML = 'Таблица элементов';
	} else if (scheme == 'weight'){
		this.header.innerHTML = 'Относительная атомная масса, а.е.м.';
	} else if (scheme == 'radioactivity'){
		this.header.innerHTML = 'Период полураспада самых стабильных изотопов';
	} else if (scheme == 'abu'){
		this.header.innerHTML = 'Содержание в солнечной системе';
	} else if (scheme == 'cAbu'){
		this.header.innerHTML = 'Содержание в земной коре';
	} else if (scheme == 'melting'){
		this.header.innerHTML = 'Температура плавления, C°';
	} else if (scheme == 'boiling'){
		this.header.innerHTML = 'Температура кипения, C°';
	} else if (scheme == 'elneg'){
		this.header.innerHTML = 'Электроотрицательность';	
	}

	for (let i = 0; i < this.stuff.length; i++){
		this.stuff[i].repaint(scheme);
	}

	let darkBack = 'rgb(2,2,2)';
	if (isDark) {
		alive.animate(this.svg, 'background-color', darkBack, 1000);
		alive.animate(this.header, 'fill', 'rgb(255,255,255)', 1000);
	} else if (window.getComputedStyle(this.svg)['backgroundColor'] != darkBack){
		alive.animate(this.svg, 'background-color', 'rgba(0,0,0,0)', 1000);
		alive.animate(this.header, 'fill', 'rgb(0,0,0)', 1000);
	}
}

function Element(periodic,number){
	this.periodic = periodic;
	this.svg = periodic.svg;
	this.element = periodic.elements[number];
	this.color = this.periodic.colorsDefault[this.element.type - 1];
	this.fontDividers = {
		big: 2,
		small: 7
	}

	this.inject();
}
Element.prototype.setSizes = function(){
	this.rect.setAttribute('width', this.periodic.cellWidth);
	this.rect.setAttribute('height', this.periodic.cellHeight);
	this.shortLabel.style.fontSize = this.periodic.cellWidth / this.fontDividers.big + 'px';
	this.shortLabel.setAttribute('x', this.periodic.cellWidth / 2);
	this.shortLabel.setAttribute('y', this.periodic.cellHeight / 2);
	this.label.style.fontSize = this.periodic.cellWidth / this.fontDividers.small + 'px';
	this.label.setAttribute('x', this.periodic.cellWidth / 2);
	this.label.setAttribute('y', this.periodic.cellHeight * 5 / 6);
	this.index.style.fontSize = this.periodic.cellWidth / this.fontDividers.small + 'px';
	this.index.setAttribute('x', this.periodic.cellWidth * .08);
	this.index.setAttribute('y', this.periodic.cellHeight * .08);
	this.atomic.style.fontSize = this.periodic.cellWidth / this.fontDividers.small + 'px';
	this.atomic.setAttribute('x', this.periodic.cellWidth * .92);
	this.atomic.setAttribute('y', this.periodic.cellHeight * .08);
}
Element.prototype.inject = function(){
	this.g = document.createElementNS(this.periodic.ns,'g');
	this.gx = this.element.position[1] * this.periodic.cellWidth + this.element.position[1] * this.periodic.gaps + this.periodic.xPadding;
	this.gy = this.element.position[0] * this.periodic.cellHeight + this.element.position[0] * this.periodic.gaps + this.periodic.yPadding; 
	let gOffsetX = 2*this.gx - this.periodic.center.x;
	let gOffsetY = 2*this.gy - this.periodic.center.y;
	this.g.setAttribute('transform','translate('+gOffsetX+','+gOffsetY+')');

	this.rect = document.createElementNS(this.periodic.ns,'rect');
	this.rect.style.fill = 'rgb(255,255,255)';

	this.shortLabel = document.createElementNS(this.periodic.ns,'text');
	this.shortLabel.style.fill = 'rgb(255,255,255)';
	this.shortLabel.style.fontWeight = 400;
	this.shortLabel.innerHTML = this.element.sn;
	this.shortLabel.setAttribute('text-anchor', 'middle');
	this.shortLabel.setAttribute('dominant-baseline', 'middle');

	this.label = document.createElementNS(this.periodic.ns,'text');
	this.label.style.fill = 'rgb(255,255,255)';
	this.label.style.fontStyle = 'italic';
	this.label.innerHTML = this.element.nameRu;
	this.label.setAttribute('text-anchor', 'middle');
	this.label.setAttribute('dominant-baseline', 'middle');

	this.index = document.createElementNS(this.periodic.ns,'text');
	this.index.style.fill = 'rgba(255,255,255,.6)';
	this.index.innerHTML = this.element.index;
	this.index.setAttribute('text-anchor', 'start');
	this.index.setAttribute('dominant-baseline', 'mathematical');

	this.atomic = document.createElementNS(this.periodic.ns,'text');
	this.atomic.style.fill = 'rgb(255,255,255)';
	this.atomic.innerHTML = this.element.atomicweight;
	this.atomic.setAttribute('text-anchor', 'end');
	this.atomic.setAttribute('dominant-baseline', 'mathematical');

	this.setSizes();

	this.g.appendChild(this.rect);
	this.g.appendChild(this.shortLabel);
	this.g.appendChild(this.label);
	this.g.appendChild(this.index);
	this.g.appendChild(this.atomic);
	this.periodic.g.appendChild(this.g);

	let randomDelay = Math.random()*1000;
	alive.animate(this.rect, 'fill', 'rgb('+this.color[0]+','+this.color[1]+','+this.color[2]+')', 2000, randomDelay);
	alive.animate(this.g, 'svgTransform', 'translate('+this.gx+','+this.gy+')', 2000, randomDelay, 'decel');
}
Element.prototype.reject = function(){
	alive.animate(this.g, 'opacity', 0, 2000, function(){this.periodic.svg.removeChild(this.g)}.bind(this),'accel')
}
Element.prototype.update = function(mode){

	let duration = 500, delay = 0;

	if (mode == 'full'){
		this.gx = this.element.position[1] * this.periodic.cellWidth + this.element.position[1] * this.periodic.gaps + this.periodic.xPadding;
		this.gy = this.element.position[0] * this.periodic.cellHeight + this.element.position[0] * this.periodic.gaps + this.periodic.yPadding;
		delay = Math.random()*50 + 1000 - this.element.index*8;	
	} else if (mode == 'minimal'){
		if ((this.element.index >=57 && this.element.index <=71) || (this.element.index >=89 && this.element.index <=103)){
			this.gx = this.element.position[1] * this.periodic.cellWidth + this.element.position[1] * this.periodic.gaps + this.periodic.cellWidth / 2  + this.periodic.xPadding;
			this.gy = (this.element.position[0] + 2) * this.periodic.cellHeight + (this.element.position[0] + 2) * this.periodic.gaps + this.periodic.yPadding + this.periodic.cellHeight / 2;
			delay = Math.random()*50 + this.element.index*4 + 200;
		} else if (this.element.position[1] > 15) {
			this.gx = (this.element.position[1] - 14) * this.periodic.cellWidth + (this.element.position[1] - 14) * this.periodic.gaps  + this.periodic.xPadding;
			this.gy = this.element.position[0] * this.periodic.cellHeight + this.element.position[0] * this.periodic.gaps + this.periodic.yPadding;
			delay = Math.random()*50 + this.element.index*2;
		} else {
			this.gx = this.element.position[1] * this.periodic.cellWidth + this.element.position[1] * this.periodic.gaps  + this.periodic.xPadding;
			this.gy = this.element.position[0] * this.periodic.cellHeight + this.element.position[0] * this.periodic.gaps + this.periodic.yPadding;
			dealy = Math.random()*50 + this.element.index*2;
		}
	} else if (mode == 'list'){
		let rowLength = 20;
		this.gx = ((this.element.index - 1) % rowLength) * this.periodic.cellWidth + ((this.element.index - 1) % rowLength) * this.periodic.gaps  + this.periodic.xPadding;
		this.gy = Math.floor((this.element.index - 1) / rowLength) * this.periodic.cellHeight + Math.floor((this.element.index - 1) / rowLength) * this.periodic.gaps + this.periodic.yPadding;
		delay = this.element.index*16;
	}

	alive.animate(this.g, 'svgTransform', 'translate('+this.gx+','+this.gy+'))', duration, delay, function(){
		this.setSizes();
	}.bind(this),'soft');

}
Element.prototype.repaint = function(scheme){
	let color = this.periodic.colorFaded;
	if (scheme == 'groups'){
		color = this.periodic.colorsDefault[this.element.type - 1];
		this.setData(this.element.sn, 2);
	} else if (scheme == 'weight'){
		color = mapColor(this.element.atomicweight/300, this.periodic.mapWeight);
		this.setData(this.element.atomicweight, 4);
	} else if (scheme == 'radioactivity'){
		if (this.element.halflife){
			color = mapColor(.0008 / this.element.halflife, this.periodic.mapRadioactivity, 'logR');
			this.setData(getReasonableTime(this.element.halflife), 5);
		} else {
			color = this.periodic.mapRadioactivity[this.periodic.mapRadioactivity.length - 1];
			this.setData('∞', 3);
		}
	} else if (scheme == 'abu'){
		if (this.element.sSAbu){
			let text = this.element.sSAbu * 75 / 28000;
			if (text > 1){
				text = Math.round(text) + '%';
			} else if (text > .01){
				text = Math.round(text * 100) / 100 + '%';
			} else if (text > .001){
				text = Math.round(text * 10000) / 100 + '‰';
			} else if (text > .000001){
				text = Math.round(text * 1000000) + ' ppm';
			} else if (text > .000000001) {
				text = Math.round(text * 1000000000) + ' ppb';
			} else {
				text = Math.round(text * 1000000000000) + ' ppt';
			}
			color = mapColor(this.element.sSAbu / 28001, this.periodic.mapAbu, 'logU');
			this.setData(text, 5);
		} else {
			this.setData(this.element.sn, 2);
		}
	} else if (scheme == 'cAbu'){
		if (this.element.cAbu){
			let text = this.element.cAbu / 10000;
			if (text > 1){
				text = Math.round(text) + '%';
			} else if (text > .01){
				text = Math.round(text * 100) / 100 + '%';
			} else if (text > .001){
				text = Math.round(text * 10000) / 100 + '‰';
			} else if (text > .000001){
				text = Math.round(text * 1000000) + ' ppm';
			} else if (text > .000000001) {
				text = Math.round(text * 1000000000) + ' ppb';
			} else {
				text = Math.round(text * 1000000000000) + ' ppt';
			}
			color = mapColor(this.element.cAbu / 461001, this.periodic.mapAbu, 'logC');
			this.setData(text, 5);
		} else {
			this.setData(this.element.sn, 2);
		}
	} else if (scheme == 'melting'){
		if (this.element.melt){
			color = mapColor(this.element.melt / 3700, this.periodic.mapMelt, [0,.02,.05,.07,.075,.08,.1,.5,.8,1]);
			this.setData(Math.round(this.element.melt - 273) + '°', 4);
		} else {
			this.setData(this.element.sn, 2);
		}
		
	} else if (scheme == 'boiling'){
		if (this.element.boil){
			color = mapColor(this.element.boil / 6300, this.periodic.mapBoil, [0,.01,.035,.04,.043,.045,.08,.3,.5,.7,1]);
			this.setData(Math.round(this.element.boil - 273) + '°', 4);
		} else {
			this.setData(this.element.sn, 2);
		}
		
	} else if (scheme == 'elneg'){
		if (this.element.elneg){
			color = mapColor((this.element.elneg - .7) / 3.3, this.periodic.mapElneg);
			this.setData(this.element.elneg, 3);
		} else {
			this.setData(this.element.sn, 2);
		}
		
	}
	

	alive.animate(this.rect, 'fill', 'rgb('+color[0]+','+color[1]+','+color[2]+')', 1000, Math.random()*100);

	if (color){
		let max = Math.max(color[0],color[1],color[2]);
		let min = Math.min(color[0],color[1],color[2]);
		let q = Math.exp(3 * (min / max) / 100)
		let l = ((q * max) + ((1 - q) * min))/255;
		if (color[0] == this.periodic.colorFaded[0] && color[1] == this.periodic.colorFaded[1] && color[2] == this.periodic.colorFaded[2]) l = 0;

		if (l > .87){
			alive.animate(this.shortLabel, 'fill', 'rgb(48,48,56)', 600);
			alive.animate(this.label, 'fill', 'rgb(48,48,56)', 600);
			alive.animate(this.index, 'fill', 'rgba(48,48,56,0.6)', 600);
			alive.animate(this.atomic, 'fill', 'rgba(48,48,56,0.6)', 600);
		} else {
			alive.animate(this.shortLabel, 'fill', 'rgb(255,255,255)', 600);
			alive.animate(this.label, 'fill', 'rgb(255,255,255)', 600);
			alive.animate(this.index, 'fill', 'rgba(255,255,255,0.6)', 600);
			alive.animate(this.atomic, 'fill', 'rgba(255,255,255,0.6)', 600);
		}
	}

	/*
	if (scheme == 'weight'){
		this.swapAtomic();
	} else {
		this.swapAtomic(true);
	}
	*/
}
Element.prototype.setData = function(data,fontDivider){
	if (data != this.shortLabel.innerHTML){
		alive.animate(this.shortLabel, 'opacity', 0, 200, Math.random() * 5 * this.element.index, function(){
			this.shortLabel.innerHTML = data;
			this.fontDividers.big = fontDivider;
			this.shortLabel.style.fontSize = this.periodic.cellWidth / this.fontDividers.big + 'px';
			alive.animate(this.shortLabel, 'opacity', 1, 200);
		}.bind(this));
	}
}
Element.prototype.swapAtomic = function(back){
	let small = back ? this.shortLabel : this.atomic;
	let big = back ? this.atomic : this.shortLabel;

	let randomDelay = Math.random()*200 + this.element.index * 10;
		alive.animate(big, 'font-size', this.periodic.cellWidth / 7 + 'px', 100, randomDelay, function(){
			big.setAttribute('text-anchor', 'end');
			big.setAttribute('dominant-baseline', 'mathematical');
			big.style.fontWeight = 200;
		}.bind(this));
		alive.animate(big, 'x', this.periodic.cellWidth * .92, 200, randomDelay);
		alive.animate(big, 'y', this.periodic.cellHeight * .08, 200, randomDelay);

		alive.animate(small, 'font-size', this.periodic.cellWidth / (back ? 2 : 3) + 'px', 100, randomDelay, function(){
			small.setAttribute('text-anchor', 'middle');
			small.setAttribute('dominant-baseline', 'middle');
			small.style.fontWeight = 400;
		}.bind(this));
		alive.animate(small, 'x', this.periodic.cellWidth / 2, 200, randomDelay);
		alive.animate(small, 'y', this.periodic.cellHeight / 2, 200, randomDelay);
}