const PI2 = Math.PI / 2;
const B1 = 1 / 2.75;
const B2 = 2 / 2.75;
const B3 = 1.5 / 2.75;
const B4 = 2.5 / 2.75;
const B5 = 2.25 / 2.75;
const B6 = 2.625 / 2.75;
const ELASTIC_AMPLITUDE = 1;
const ELASTIC_PERIOD = 0.4;

export function linear(t:number):number
{
	return t;
}

export function quadIn(t:number):number
{
	return t * t;
}

export function quadOut(t:number):number
{
	return -t * (t - 2);
}

export function quadInOut(t:number):number
{
	return t <= .5 ? t * t * 2 : 1 - (--t) * t * 2;
}

export function cubeIn(t:number):number
{
	return t * t * t;
}

export function cubeOut(t:number):number
{
	return 1 + (--t) * t * t;
}

export function cubeInOut(t:number):number
{
	return t <= .5 ? t * t * t * 4 : 1 + (--t) * t * t * 4;
}

export function quartIn(t:number):number
{
	return t * t * t * t;
}

export function quartOut(t:number):number
{
	return 1 - (t -= 1) * t * t * t;
}

export function quartInOut(t:number):number
{
	return t <= .5 ? t * t * t * t * 8 : (1 - (t = t * 2 - 2) * t * t * t) / 2 + .5;
}

export function quintIn(t:number):number
{
	return t * t * t * t * t;
}

export function quintOut(t:number):number
{
	return (t = t - 1) * t * t * t * t + 1;
}

export function quintInOut(t:number):number
{
	return ((t *= 2) < 1) ? (t * t * t * t * t) / 2 : ((t -= 2) * t * t * t * t + 2) / 2;
}

/** @since 4.3.0 */
export function smoothStepIn(t:number):number
{
	return 2 * smoothStepInOut(t / 2);
}

/** @since 4.3.0 */
export function smoothStepOut(t:number):number
{
	return 2 * smoothStepInOut(t / 2 + 0.5) - 1;
}

/** @since 4.3.0 */
export function smoothStepInOut(t:number):number
{
	return t * t * (t * -2 + 3);
}

/** @since 4.3.0 */
export function smootherStepIn(t:number):number
{
	return 2 * smootherStepInOut(t / 2);
}

/** @since 4.3.0 */
export function smootherStepOut(t:number):number
{
	return 2 * smootherStepInOut(t / 2 + 0.5) - 1;
}

/** @since 4.3.0 */
export function smootherStepInOut(t:number):number
{
	return t * t * t * (t * (t * 6 - 15) + 10);
}

export function sineIn(t:number):number
{
	return -Math.cos(PI2 * t) + 1;
}

export function sineOut(t:number):number
{
	return Math.sin(PI2 * t);
}

export function sineInOut(t:number):number
{
	return -Math.cos(Math.PI * t) / 2 + .5;
}

export function bounceIn(t:number):number
{
	t = 1 - t;
	if (t < B1)
		return 1 - 7.5625 * t * t;
	if (t < B2)
		return 1 - (7.5625 * (t - B3) * (t - B3) + .75);
	if (t < B4)
		return 1 - (7.5625 * (t - B5) * (t - B5) + .9375);
	return 1 - (7.5625 * (t - B6) * (t - B6) + .984375);
}

export function bounceOut(t:number):number
{
	if (t < B1)
		return 7.5625 * t * t;
	if (t < B2)
		return 7.5625 * (t - B3) * (t - B3) + .75;
	if (t < B4)
		return 7.5625 * (t - B5) * (t - B5) + .9375;
	return 7.5625 * (t - B6) * (t - B6) + .984375;
}

export function bounceInOut(t:number):number
{
	if (t < .5)
	{
		t = 1 - t * 2;
		if (t < B1)
			return (1 - 7.5625 * t * t) / 2;
		if (t < B2)
			return (1 - (7.5625 * (t - B3) * (t - B3) + .75)) / 2;
		if (t < B4)
			return (1 - (7.5625 * (t - B5) * (t - B5) + .9375)) / 2;
		return (1 - (7.5625 * (t - B6) * (t - B6) + .984375)) / 2;
	}
	t = t * 2 - 1;
	if (t < B1)
		return (7.5625 * t * t) / 2 + .5;
	if (t < B2)
		return (7.5625 * (t - B3) * (t - B3) + .75) / 2 + .5;
	if (t < B4)
		return (7.5625 * (t - B5) * (t - B5) + .9375) / 2 + .5;
	return (7.5625 * (t - B6) * (t - B6) + .984375) / 2 + .5;
}

export function circIn(t:number):number
{
	return -(Math.sqrt(1 - t * t) - 1);
}

export function circOut(t:number):number
{
	return Math.sqrt(1 - (t - 1) * (t - 1));
}

export function circInOut(t:number):number
{
	return t <= .5 ? (Math.sqrt(1 - t * t * 4) - 1) / -2 : (Math.sqrt(1 - (t * 2 - 2) * (t * 2 - 2)) + 1) / 2;
}

export function expoIn(t:number):number
{
	return Math.pow(2, 10 * (t - 1));
}

export function expoOut(t:number):number
{
	return -Math.pow(2, -10 * t) + 1;
}

export function expoInOut(t:number):number
{
	return t < .5 ? Math.pow(2, 10 * (t * 2 - 1)) / 2 : (-Math.pow(2, -10 * (t * 2 - 1)) + 2) / 2;
}

export function backIn(t:number):number
{
	return t * t * (2.70158 * t - 1.70158);
}

export function backOut(t:number):number
{
	return 1 - (--t) * (t) * (-2.70158 * t - 1.70158);
}

export function backInOut(t:number):number
{
	t *= 2;
	if (t < 1)
		return t * t * (2.70158 * t - 1.70158) / 2;
	t--;
	return (1 - (--t) * (t) * (-2.70158 * t - 1.70158)) / 2 + .5;
}

export function elasticIn(t:number):number
{
	return -(ELASTIC_AMPLITUDE * Math.pow(2,
		10 * (t -= 1)) * Math.sin((t - (ELASTIC_PERIOD / (2 * Math.PI) * Math.asin(1 / ELASTIC_AMPLITUDE))) * (2 * Math.PI) / ELASTIC_PERIOD));
}

export function elasticOut(t:number):number
{
	return (ELASTIC_AMPLITUDE * Math.pow(2,
		-10 * t) * Math.sin((t - (ELASTIC_PERIOD / (2 * Math.PI) * Math.asin(1 / ELASTIC_AMPLITUDE))) * (2 * Math.PI) / ELASTIC_PERIOD)
		+ 1);
}

export function elasticInOut(t:number):number
{
	if (t < 0.5)
	{
		return -0.5 * (Math.pow(2, 10 * (t -= 0.5)) * Math.sin((t - (ELASTIC_PERIOD / 4)) * (2 * Math.PI) / ELASTIC_PERIOD));
	}
	return Math.pow(2, -10 * (t -= 0.5)) * Math.sin((t - (ELASTIC_PERIOD / 4)) * (2 * Math.PI) / ELASTIC_PERIOD) * 0.5 + 1;
}
