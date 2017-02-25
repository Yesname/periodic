function Alive(){
	this.animations = [];
	this.lt = Date.now();
	this.dt = 0;
	this.tt = 0;
	this.properties = [
		{name: 'opacity', type: 'int', css: 'opacity'},
		{name: 'margin-top', type: 'px', css: 'marginTop'},
		{name: 'font-size', type: 'px', css: 'fontSize'},
		{name: 'background-color', type: 'rgba', css: 'backgroundColor'},
		{name: 'fill', type: 'rgba', css: 'fill'},
		{name: 'transform', type: 'transform', css: 'transform'},
		{name: 'svgTransform', type: 'svgTransform', css: 'transform', isAttr: true},
		{name: 'svgWidth', type: 'int', css: 'width', isAttr: true},
		{name: 'svgHeight', type: 'int', css: 'height', isAttr: true},
		{name: 'x', type: 'int', css: 'x', isAttr: true},
		{name: 'y', type: 'int', css: 'y', isAttr: true}
	];
};
Alive.prototype.select = function(element){
	if (typeof element == 'string'){
		let dom_id = document.getElementById(element);
		let dom_class = document.getElemensByClassName(element);
		if (dom_id || dom_class){
			return dom_id ? dom_id : dom_class;
		} else {
			console.log('Cannot locate element :(');
			return false;
		}
	} else {
		return element;
	}
};
Alive.prototype.getProperty = function(property){
	let found = false;
	for (let i = 0; i < this.properties.length; i++){
		if (property === this.properties[i].name){
			found = this.properties[i];
			i = this.properties.length;
		}
	}
	if (found){
		return found;
	} else {
		console.log('I dont know how to work with '+property+' property :(');
	}
}
Alive.prototype.animate = function(element,property,value,duration,delay,callback,easing){
	if (element && property && value != undefined){
		let node = this.select(element);
		let validProperty = this.getProperty(property);
		let currentPropertyValue, startValue, endValue, combinator, validDuration = 1000, validDelay = 0, validCallback, validEasing;

		if (node && validProperty){
			if (validProperty.isAttr){
				currentPropertyValue = node.getAttribute(validProperty.css);
			} else {
				currentPropertyValue = window.getComputedStyle(node)[validProperty.css];
			}
			if (validProperty.type === 'int'){
				startValue = +currentPropertyValue || 0;
				endValue = +value;
			} else if (validProperty.type === 'px'){
				let pxPosition = value.indexOf('px');
				if (pxPosition != -1){
					combinator = function(one){
						return one + 'px';
					};
					startValue = +currentPropertyValue.slice(0,currentPropertyValue.indexOf('px'));
					endValue = +value.slice(0,pxPosition);
					
				} else {
					console.log('You should use px in your property value');
				}
			} else if (validProperty.type === 'rgba'){
				let parsedStart = currentPropertyValue.match(/-?[0-9]+([.][0-9]+)?/g);
				let parsedEnd;
				let isHex = value.indexOf('#');
				if (isHex != -1){
					let valueRgba = hexToRgbA(value);
					parsedEnd = valueRgba.match(/-?[0-9]+([.][0-9]+)?/g);
				} else {
					parsedEnd = value.match(/-?[0-9]+([.][0-9]+)?/g);
				}
				if (parsedStart[0] === '0' && parsedStart[1] === '0' && parsedStart[2] === '0' && parsedStart[3] === '0'){
					parsedStart[0] = parsedEnd[0];
					parsedStart[1] = parsedEnd[1];
					parsedStart[2] = parsedEnd[2];
					parsedStart[3] = '0';
				} else if (!parsedStart[3]){
					parsedStart[3] = '1';
				}
				if (!parsedEnd[3]) parsedEnd[3] = 1;
				combinator = function(four){
					return 'rgba('+Math.round(four[0])+','+Math.round(four[1])+','+Math.round(four[2])+','+four[3]+')';
				}
				startValue = [+parsedStart[0], +parsedStart[1], +parsedStart[2], +parsedStart[3]];
				endValue = [+parsedEnd[0], +parsedEnd[1], +parsedEnd[2], +parsedEnd[3]];

			} else if (validProperty.type === 'transform'){
				let parsedStart = currentPropertyValue.match(/-?[0-9]+([.][0-9]+)?/g);
				let parsedEnd = value.match(/-?[0-9]+([.][0-9]+)?/g);
				if (!parsedStart) {								//HARDCODED TRANSLATE. ADD 1.3e-13 VALIDATION
					parsedStart = ['0','0']
				} else {
					parsedStart.splice(0,4);
				}			

				combinator = function(two){									
					return 'translate('+two[0]+'px, '+two[1]+'px)';
				}
				startValue = [+parsedStart[0], +parsedStart[1]];
				endValue = [+parsedEnd[0], +parsedEnd[1]];
			} else if (validProperty.type === 'svgTransform'){
				let parsedStart = currentPropertyValue.match(/-?[0-9]+([.][0-9]+)?/g);
				let parsedEnd = value.match(/-?[0-9]+([.][0-9]+)?/g);
				if (!parsedStart) {								
					parsedStart = ['0','0','1'];
				}
				if (!parsedStart[2]){
					parsedStart[2] = '1';
				}
				if (parsedEnd.length == 2){
					parsedEnd[2] = '1';
				} else if (parsedEnd.length == 1){
					parsedEnd[2] = parsedEnd[0];
					parsedEnd[0] = parsedStart[0];
					parsedEnd[1] = parsedStart[1];
				}

				combinator = function(three){									
					return 'translate('+three[0]+', '+three[1]+') scale('+three[2]+')';
				}
				startValue = [+parsedStart[0], +parsedStart[1], +parsedStart[2]];
				endValue = [+parsedEnd[0], +parsedEnd[1], +parsedEnd[2]];
			};

			if (startValue != undefined && endValue != undefined){
				if (typeof duration == 'number'){
					validDuration = duration;
				} else {
					console.log('Do this: element, property, final value, duration, delay, callback, easing');
				};
				if (delay){
					if (typeof delay == 'number'){
						validDelay = delay;
					} else if (typeof delay == 'function'){
						validCallback = delay;
					} else if (typeof delay == 'string'){
						validEasing = delay;
					} else {
						console.log('Do this: element, property, final value, duration, delay, callback, easing');
					}
				};
				if (callback){
					if (typeof callback == 'function'){
						validCallback = callback;
					} else if (typeof callback == 'string'){
						validEasing = callback;
					} else {
						console.log('I dont know how to handle callback so I will do nonthing on animation end');
					}
				}
				if (easing){								//VALIDATE!
					if (typeof easing == 'string'){
						validEasing = easing
					} else {
						console.log('I dont know about such interpolation, sorry');
					}
				}
			};
			new alive_Animation(
				node,
				validDuration,
				validDelay,
				validProperty,
				startValue,
				endValue,
				combinator,
				validCallback,
				validEasing
			);

		} else {
			console.log('Do this: element, property, final value, duration, delay, callback, easing');
		}
		
	} else {
		console.log('Give me something to work with! — sincerely, Alive')
	}
};
Alive.prototype.frame = function(){
	for (let i = 0; i < alive.animations.length; i++){
		alive.animations[i].frame();
	}
	for (let t = 0; t < alive.animations.length; t++){
		if (alive.animations[t].finished){
			alive.animations.splice(t,1);
			t--;
		}
	};
}

// Animation object
function alive_Animation(element,duration,delay,property,startValue,endValue,combinator,callback,interpolation){
	this.element = element;
	this.property = property;
	this.isAttr = property.isAttr;
	this.callback = callback;
	this.startTime = alive.lt + Math.round(delay);
	this.currentTime = alive.lt;
	this.endTime = this.startTime + Math.round(duration);
	this.interpolation = interpolation || false;
	this.startValue = startValue;
	this.endValue = endValue;
	this.currentValue = [];
	this.combinator = combinator;
	this.id = alive.animations.length;
	this.finished = false;
	let interrupt = false;
	for (let s = 0; s < alive.animations.length; s++){
		if (this.element == alive.animations[s].element && this.property.name == alive.animations[s].property.name){
			alive.animations[s] = this;
			interrupt = true;
		}
	};
	if (!interrupt){
		alive.animations.push(this);
	}
};
alive_Animation.prototype.frame = function(){
	this.currentTime += alive.dt;
	if (this.currentTime >= this.startTime){
		if (this.currentTime < this.endTime){
			if (this.interpolation != 'jump'){
				if (typeof this.startValue === 'object' && this.combinator){
					for (let i = 0; i < this.startValue.length; i++){
						this.currentValue[i] = map(this.currentTime, [this.startTime, this.endTime], [this.startValue[i], this.endValue[i]], this.interpolation);
						if (this.property.isRounded) this.currentValue[i] = Math.round(this.currentValue[i]);
					}
					if (this.isAttr){
						this.element.setAttribute(this.property.css, this.combinator(this.currentValue));
					} else {
						this.element.style[this.property.css] = this.combinator(this.currentValue);
					}
				} else {
					if (this.combinator){
						this.currentValue = map(this.currentTime, [this.startTime, this.endTime], [this.startValue, this.endValue], this.interpolation);
						if (this.property.isRounded) this.currentValue = Math.round(this.currentValue);
						if (this.isAttr){
							this.element.setAttribute(this.property.css, this.combinator(this.currentValue));
						} else {
							this.element.style[this.property.css] = this.combinator(this.currentValue);
						}
					} else {
						let mapped = map(this.currentTime, [this.startTime, this.endTime], [this.startValue, this.endValue], this.interpolation);
						if (this.property.isRounded) mapped = Math.round(mapped);
						if (this.isAttr){
							this.element.setAttribute(this.property.css, mapped);
						} else {
							this.element.style[this.property.css] = mapped;
						}
					}
				}	
			}
		} else {
			if (this.combinator){
				if (this.isAttr){
					this.element.setAttribute(this.property.css, this.combinator(this.endValue));
				} else {
					this.element.style[this.property.css] = this.combinator(this.endValue);
				}
				
			} else {
				if (this.isAttr){
					this.element.setAttribute(this.property.css, this.endValue);
				} else {	
					this.element.style[this.property.css] = this.endValue;
				}
				
			}
			this.finished = true;
			if (this.callback) this.callback();
		}
		
	}
};

// Mapping function for numbers using interpolators

function map(value,domain,range,interpolation){
    if (interpolation === 'decel'){
    	return range[0] + (range[1] - range[0]) * interCubeDecel((value - domain[0]) / (domain[1] - domain[0]));
    } else if (interpolation === 'accel') {
    	return range[0] + (range[1] - range[0]) * interCubeAccel((value - domain[0]) / (domain[1] - domain[0]));
   	} else if (interpolation === 'elastic'){
   		return range[0] + (range[1] - range[0]) * invert(elastic)((value - domain[0]) / (domain[1] - domain[0]));
    } else if (interpolation === 'soft'){
    	return range[0] + (range[1] - range[0]) * interCubeFull((value - domain[0]) / (domain[1] - domain[0]));
    } else { //Linear
        return range[0] + (range[1] - range[0]) * (value - domain[0]) / (domain[1] - domain[0]);
    }
};
function mapColor(frac,colors,interpolation){
        let fraction = frac > 1 ? 1 : frac < 0 ? 0 : frac;
        let marker = undefined;
        let stops = [];
        if (typeof interpolation === 'object'){
        	stops = interpolation;
        } else {
        	if (interpolation === 'logR' && fraction != 1){
        		fraction = Math.abs(Math.log(fraction) / 80);
        		fraction = fraction > 1 ? 1 : fraction < 0 ? 0 : fraction;
        	} else if (interpolation === 'logU' && fraction != 1){
        		fraction = Math.abs(Math.log(fraction) / 27);
        		fraction = fraction > 1 ? 1 : fraction < 0 ? 0 : fraction;
        	} else if (interpolation === 'logC' && fraction != 1){
        		fraction = Math.abs(Math.log(fraction) / 20);
        		fraction = fraction > 1 ? 1 : fraction < 0 ? 0 : fraction;
        	}
        	for (let i = 0; i <= 1; i += 1 / (colors.length - 1)){
        		stops.push(i);
        	}
        	stops[stops.length - 1] = 1;
        }
        for (let i = 1; i < stops.length; i++){
            if (fraction <= stops[i]){
                marker = i - 1;
                break;
            }
        }
        try{
        if (marker != undefined){
            let from = stops[marker]
            let to = stops[marker + 1];
            let colorFrom = colors[marker];
            let colorTo = colors[marker + 1];
            let r = Math.floor(map(fraction,[from,to],[colorFrom[0],colorTo[0]]));
            let g = Math.floor(map(fraction,[from,to],[colorFrom[1],colorTo[1]]));
            let b = Math.floor(map(fraction,[from,to],[colorFrom[2],colorTo[2]]));
            let a = map(fraction,[from,to],[colorFrom[3],colorTo[3]]);

            r = r < 0 ? 0 : r > 255 ? 255 : r;
            g = g < 0 ? 0 : g > 255 ? 255 : g;
            b = b < 0 ? 0 : b > 255 ? 255 : b;
            a = a < 0 ? 0 : a > 1 ? 1 : a;
            return [r,g,b,a];
        }
    } catch (err){
        console.log('Something just wrong',colors,marker);
    }
} 

// Cubic deceleration interpolator
function interCubeDecel(x){
	v0 = -2;
	v1 = 0;
	v2 = 1;
	v3 = 0;

	P = (v3 - v2) - (v0 - v1);
	Q = (v0 - v1) - P;
	R = v2 - v0;
	S = v1;

	return P*Math.pow(x,3) + Q*Math.pow(x,2) + R*x + S;
};

// Cubic acceleration interpolator
function interCubeAccel(x){
	v0 = 1;
	v1 = 0;
	v2 = 1;
	v3 = 3;

	P = (v3 - v2) - (v0 - v1);
	Q = (v0 - v1) - P;
	R = v2 - v0;
	S = v1;

	return P*Math.pow(x,3) + Q*Math.pow(x,2) + R*x + S;
};
function interCubeFull(x){
	v0 = 1;
	v1 = 0;
	v2 = 1;
	v3 = 0;

	P = (v3 - v2) - (v0 - v1);
	Q = (v0 - v1) - P;
	R = v2 - v0;
	S = v1;

	return P*Math.pow(x,3) + Q*Math.pow(x,2) + R*x + S;
};

function elastic(x) {
  return Math.pow(2, 10 * (x - 1)) * 1.15 * Math.cos(27 * Math.PI / 7.04 * x);
}
function invert(interpolator){
	return function(x){
		return 1 - interpolator(1-x);
	}
};
function hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
    }
    throw new Error('Very bad hex');
}

window.alive = new Alive();
window.alive.engine = function(){
	var now = Date.now();
	alive.dt = now - alive.lt;
	alive.lt = now;
	alive.tt += alive.dt;
	alive.frame();
	requestAnimationFrame(alive.engine);
};
alive.engine();