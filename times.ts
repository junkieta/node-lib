/**
 * PHP::DateTimeと近い感覚で時間所法を処理するためのライブラリ。
 **/

/**
 * like PHP:DateTime
 * */
export class DateTime {

	/**
	* Y-m-d\\TH:i:sP
	* @constant
	* @return {String}
	*/
    static ATOM = 'Y-m-d\\TH:i:sP';

	/**
	* l, d-M-y H:i:s T
	* @constant
	* @return {String}
	*/
    static COOKIE = 'l, d-M-y H:i:s T';

	/**
	* Y-m-d\\TH:i:sP
	* @constant
	* @return {String}
	*/
    static ISO8601 = 'Y-m-d\\TH:i:sO';

	/**
	* D, d M y H:i:s O
	* @constant
	* @return {String}
	*/
    static RFC822 = 'D, d M y H:i:s O';

	/**
	* l, d-M-y H:i:s T
	* @constant
	* @return {String}
	*/
    static RFC850 = 'l, d-M-y H:i:s T';

	/**
	* D, d M y H:i:s O
	* @constant
	* @return {String}
	*/
    static RFC1036 = 'D, d M y H:i:s O';

	/**
	* D, d M Y H:i:s O
	* @constant
	* @return {String}
	*/
    static RFC1123 = 'D, d M Y H:i:s O';

	/**
	* D, d M Y H:i:s O
	* @constant
	* @return {String}
	*/
    static RFC2822 = 'D, d M Y H:i:s O';

	/**
	* Y-m-d\\TH:i:sP
	* @constant
	* @return {String}
	*/
    static RFC3339 = 'Y-m-d\\TH:i:sP';

	/**
	* D, d M Y H:i:s O
	* @constant
	* @return {String}
	*/
    static RSS = 'D, d M Y H:i:s O';

	/**
	* Y-m-d\\TH:i:sP
	* @constant
	* @return {String}
	*/
    static W3C = 'Y-m-d\\TH:i:sP';


    private time : number;

    constructor(date?: any, ...args: number[]) {
        if (date instanceof DateTime) {
            this.time = date.time;
        } else if (date instanceof Date) {
            this.time = date.getTime();
        } else if (typeof date === 'number') {
            this.time = date;
        } else if (typeof date === 'undefined') {
            this.time = Date.now();
        } else if (args.length) {
            this.time = (new Date(date || 0, args[0] || 0, args[1] || 0, args[2] || 0, args[3] || 0, args[4] || 0)).getTime();
        } else {
            this.time = (new Date(date)).getTime();
        }
    }

    format(format: 'w' | 'Y' | 'n' | 'j', timestamp?: any): number;
    format(format: string, timestamp?: any): string | number {
        var date_tr = new DateTransform(format);
        var date = typeof timestamp === 'undefined'
            ? this.toDate()
            : timestamp instanceof Date
                ? timestamp
                : new Date(timestamp * 1000);
        return date_tr.transform(date);
    };

	/**
	 *
	 * @param {DateTime} other
	 * @returns {DateInterval}
	 */
    diff(other: DateTime, absolute: boolean) {
        return datetime.diff(this, other, absolute);
    };

	/**
	 *
	 * @param {DateInterval|Object} interval
	 * @returns {DateTime}
	 */
    add(interval: DateInterval) {
        var op = interval.invert
            ? { y: -interval.y, m: -interval.m, d: -interval.d, h: -interval.h, i: -interval.i, s: -interval.s }
            : interval;
        var date = this.toDate();
        if (op.y || op.m || op.d)
            date.setFullYear(date.getFullYear() + op.y, date.getMonth() + op.m, date.getDate() + op.d);
        if (op.h || op.i || op.s)
            date.setHours(date.getHours() + op.h, date.getMinutes() + op.i, date.getSeconds() + op.s);
        return new DateTime(date);
    };

	/**
	 *
	 * @param {DateInterval} interval
	 * @returns {DateTime}
	 */
    sub(interval: DateInterval) {
        var invert, result;
        invert = interval.invert;
        interval.invert = invert ? 0 : 1;
        result = this.add(interval);
        interval.invert = invert;
        return result;
    };

	/**
	 *
	 * @returns {Date}
	 */
    toDate() {
        return new Date(this.time);
    };

	/**
	 *
	 * @returns {Number}
	 */
    valueOf() {
        return this.time;
    };

	/**
	 * @returns {String}
	 */
    toString() {
        return this.toDate().toString();
    };


}


type DATE_TRANSFORM_KEYS =
    'd' | 'D' | 'j' | 'l' | 'N' | 'S' | 'w' | 'z' | 'W' | 'F' | 'm' | 'M' | 'n' | 't' | 'L' | 'o' | 'Y' | 'y' |
    'a' | 'A' | 'B' | 'g' | 'G' | 'h' | 'H' | 'i' | 's' | 'u' | 'e' | 'I' | 'O' | 'P' | 'T' | 'Z' | 'U' | 'c' | 'r';

/**
	* フォーマット文字列の解釈用オブジェクト
	* @constructor
	*/

export class DateTransform {

    static timezone = {
        abbr: '',
        id : ''
    };

    public dateFormat: string;

    public MONTH_FULLNAMES =
        ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    public MONTH_SHORTNAMES =
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    public DAY_FULLNAMES =
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    public DAY_FULLNAMES_JP =
        ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

    public DAY_SHORTNAMES =
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    public DAY_SHORTNAMES_JP =
        ['日', '月', '火', '水', '木', '金', '土'];

    constructor(format: string) {
        this.dateFormat = format;
    }

	/**
		*
		* @param value
		* @param {Number} count
		* @returns String
		*/
    zerofill(value:number, count:number) {
        const str = value + '';
        const num = count - str.length;
        return num >= 0 ? Array(num).fill(0).join('') + str : str;
    }

	/**
		* DateTime::format相当のメソッド。
		* @param {Date} date
		* @returns {String}
		*/
    transform(date: Date) : string | number {
        return this.dateFormat.split('').reduce((str, c) => {
            var callable = typeof this[<DATE_TRANSFORM_KEYS>c] === 'function' && str.charAt(str.length - 1) !== '\\';
            return str + (callable ? (this[<DATE_TRANSFORM_KEYS>c])(date) : c);
        }, '');
    }

    // Day
	/**
		*
		* @param {Date} date
		* @return {*}
		*/
    d(date:Date) { // Day of month w/leading 0; 01..31
        return this.zerofill(date.getDate(), 2);
    }

	/**
		*
		* @param {Date} date
		* @return {Array.<T>|string|Blob|*}
		*/
    D(date:Date) { // Shorthand day name; Mon...Sun
        return this.l(date).slice(0, 3);
    }

	/**
		*
		* @param {Date} date
		* @return {number}
		*/
    j(date:Date) { // Day of month; 1..31
        return date.getDate();
    }

	/**
		*
		* @param {Date} date
		* @return {*}
		*/
    l(date:Date) { // Full day name; Monday...Sunday
        return this.DAY_FULLNAMES[date.getDay()];
    }

	/**
		*
		* @param {Date} date
		* @return {number}
		*/
    N(date:Date) { // ISO-8601 day of week; 1[Mon]..7[Sun]
        return date.getDay() || 7;
    }

	/**
		*
		* @param {Date} date
		* @return {string}
		*/
    S(date:Date) { // Ordinal suffix for day of month; st, nd, rd, th
        var j = date.getDate();
        var i = j % 10;
        if (i <= 3 && 10 <= j && j <= 19)
            i = 0;
        return ['st', 'nd', 'rd'][i - 1] || 'th';
    }

	/**
		*
		* @param {Date} date
		* @return {number}
		*/
    w(date:Date) { // Day of week; 0[Sun]..6[Sat]
        return date.getDay();
    }

	/**
		*
		* @param {Date} date
		* @return {number}
		*/
    z(date:Date) { // Day of year; 0..365
        const a = new Date(date.getFullYear(), date.getMonth() + 1 - 1, date.getDate());
        const b = new Date(date.getFullYear(), 0, 1);
        const c = a.getTime() - b.getTime();
        return Math.round(c / 864e5);
    }

    // Week
	/**
		*
		* @param {Date} date
		* @return {*}
		*/
    W(date:Date) { // ISO-8601 week number
        var a = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getMonth() + 1 + 3);
        var b = new Date(a.getFullYear(), 0, 4);
        return this.zerofill(1 + Math.round((a.getTime() - b.getTime()) / 864e5 / 7), 2);
    }

    // Month
	/**
		*
		* @param {Date} date
		* @return {*}
		*/
    F(date:Date) { // Full month name; January...December
        return this.MONTH_FULLNAMES[date.getMonth()];
    }

	/**
		*
		* @param {Date} date
		* @return {*}
		*/
    m(date:Date) { // Month w/leading 0; 01...12
        return this.zerofill(date.getMonth() + 1, 2);
    }

	/**
		*
		* @param {Date} date
		* @return {*}
		*/
    M(date:Date) { // Shorthand month name; Jan...Dec
        return this.MONTH_SHORTNAMES[date.getMonth()];
    }

	/**
		*
		* @param {Date} date
		* @return {number}
		*/
    n(date:Date) { // Month; 1...12
        return date.getMonth() + 1;
    }

	/**
		*
		* @param {Date} date
		* @return {number}
		*/
    t(date:Date) { // Days in month; 28...31
        return (new Date(date.getFullYear(), date.getMonth() + 1, 0)).getDate();
    }

    // Year
	/**
		*
		* @param {Date} date
		* @return {number}
		*/
    L(date:Date) { // Is leap year?; 0 or 1
        var j = date.getFullYear();
        return (j % 4 === 0 && j % 100 !== 0 || j % 400 === 0) ? 1 : 0;
    }

	/**
		*
		* @param {Date} date
		* @return {number}
		*/
    o(date:Date) { // ISO-8601 year
        var n = date.getMonth() + 1;
        var W = Number(this.W(date));
        var Y = date.getFullYear();
        return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
    }

	/**
		*
		* @param {Date} date
		* @return {number}
		*/
    Y(date:Date) { // Full year; e.g. 1980...2010
        return date.getFullYear();
    }

	/**
		*
		* @param {Date} date
		* @return {string}
		*/
    y(date:Date) { // Last two digits of year; 00...99
        return date.getFullYear().toString().slice(-2);
    }

    // Time
	/**
		*
		* @param {Date} date
		* @return {string}
		*/
    a(date:Date) { // am or pm
        return date.getHours() > 11 ? 'pm' : 'am';
    }

	/**
		*
		* @param {Date} date
		* @return {string}
		*/
    A(date:Date) { // AM or PM
        return date.getHours() > 11 ? 'PM' : 'AM';
    }

	/**
		*
		* @param {Date} date
		* @return {*}
		*/
    B(date:Date) { // Swatch Internet time; 000..999
        var H = date.getUTCHours() * 36e2;
        // Hours
        var i = date.getUTCMinutes() * 60;
        // Minutes
        var s = date.getUTCSeconds(); // Seconds
        return this.zerofill(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
    }

	/**
		*
		* @param {Date} date
		* @return {number}
		*/
    g(date:Date) { // 12-Hours; 1..12
        return date.getHours() % 12 || 12;
    }

	/**
		*
		* @param {Date} date
		* @return {number}
		*/
    G(date:Date) { // 24-Hours; 0..23
        return date.getHours();
    }

	/**
		*
		* @param {Date} date
		* @return {*}
		*/
    h(date:Date) { // 12-Hours w/leading 0; 01..12
        return this.zerofill(date.getHours() % 12 || 12, 2);
    }

	/**
		*
		* @param {Date} date
		* @return {String}
		*/
    H(date:Date) { // 24-Hours w/leading 0; 00..23
        return this.zerofill(date.getHours(), 2);
    }

	/**
		*
		* @param {Date} date
		* @return {String}
		*/
    i(date:Date) { // Minutes w/leading 0; 00..59
        return this.zerofill(date.getMinutes(), 2);
    }

	/**
		*
		* @param {Date} date
		* @return {String}
		*/
    s(date:Date) { // Seconds w/leading 0; 00..59
        return this.zerofill(date.getSeconds(), 2);
    }

	/**
		*
		* @param {Date} date
		* @return {*}
		*/
    u(date:Date) { // Microseconds; 000000-999000
        return this.zerofill(date.getMilliseconds() * 1000, 6);
    }

    // Timezone
	/**
		*
		* @param {Date} date
		* @return string
		*/
    e(date:Date) {
        var tz = DateTransform.timezone;
        if (!tz || !tz.id) throw new Error('not supported');
        return tz.id;
    }

	/**
		*
		* @param {Date} date
		* @return {number}
		* @constructor
		*/
    I(date:Date) {
        var years = date.getFullYear();
        // DST observed?; 0 or 1
        // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
        // If they are not equal, then DST is observed.
        var a = new Date(years, 0);
        // Jan 1
        var c = Date.UTC(years, 0);
        // Jan 1 UTC
        var b = new Date(years, 6);
        // Jul 1
        var d = Date.UTC(years, 6); // Jul 1 UTC
        return ((a.getTime() - c) !== (b.getTime() - d)) ? 1 : 0;
    }

	/**
		*
		* @param {Date} date
		* @return {string}
		* @constructor
		*/
    O(date:Date) { // Difference to GMT in hour format; e.g. +0200
        var tzo = date.getTimezoneOffset();
        var a = Math.abs(tzo);
        return (tzo > 0 ? '-' : '+') + this.zerofill(Math.floor(a / 60) * 100 + a % 60, 4);
    }

	/**
		*
		* @param {Date} date
		* @return {string}
		* @constructor
		*/
    P(date:Date) { // Difference to GMT w/colon; e.g. +02:00
        var O = this.O(date);
        return (O.substr(0, 3) + ':' + O.substr(3, 2));
    }

	/**
		*
		* @param {Date} date
		* @return {string}
		* @constructor
		*/
    T(date:Date) {
        var tz = DateTransform.timezone;
        if (!tz || !tz.abbr) throw new Error('not supported');
        return tz.abbr;
    }

	/**
		*
		* @param {Date} date
		* @return {number}
		* @constructor
		*/
    Z(date:Date) { // Timezone offset in seconds (-43200...50400)
        return -(date.getTimezoneOffset() * 60);
    }

	/**
		*
		* @param {Date} date
		* @return {number}
		* @constructor
		*/
    U(date:Date) { // Seconds since UNIX epoch
        return date.getTime() / 1000 | 0;
    }

    c(date:Date) {
        return (new DateTransform(DateTime.ISO8601)).transform(date);
    }

    r(date: Date) {
        return (new DateTransform(DateTime.RFC2822)).transform(date);
    }

}

export class DateInterval {

    // コンストラクタで引き受ける引数
    static intervalSpecRe =
        /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;

    static transform(interval: DateInterval, str: string) {
        var meta_char = str.charAt(1);
        if (meta_char === '%') return meta_char;

        type INTERVAL_SPEC_CHAR_PLUS = 'y' | 'm' | 'd' | 'h' | 'i' | 's' | 'r' | 'a';
        var meta_char_lower = <INTERVAL_SPEC_CHAR_PLUS>meta_char.toLowerCase();
        switch (meta_char_lower) {
            case 'r':
                return interval.invert ? (meta_char === 'R' ? '+' : '') : '-';
            case 'a':
                return interval.days;
        }

        var data = interval[meta_char_lower];
        return typeof data === 'undefined'
            ? meta_char
            : meta_char !== meta_char_lower && data < 10
                ? '0' + data
                : data;
    }

    public y = 0;
    public m = 0;
    public d = 0;
    public h = 0;
    public i = 0;
    public s = 0;
    public invert = 0;
    public days : number | false;

    constructor(interval_spec?: string) {
        this.days = false;
        if (!interval_spec) return;

        var matched, chars, flag, index, value;
        matched = DateInterval.intervalSpecRe.exec(interval_spec);
        if (!matched) throw new Error('不正な間隔指定子です');

        type INTERVAL_SPEC_CHAR = 'y' | 'm' | 'd' | 'h' | 'i' | 's';
        chars = 'ymdhis';
        flag = 0;
        for (index = 1; index < 7; index++) {
            value = parseInt(matched[index]);
            if (isNaN(value)) continue;
            this[<INTERVAL_SPEC_CHAR>chars.charAt(index - 1)] += value;
            flag |= index;
        }
        if (!flag) throw new Error('不正な間隔指定子です');
    }

    format(format : string) {
        return (format + "").replace(/%[%ymdhisra]/i,
            (str: string) => <string>DateInterval.transform(this, str));
    }


}

export class DatePeriod {

    static EXCLUDE_START_DATE = 1;

    public begin: DateTime;
    public interval: DateInterval;
    public end: DateTime;
    private _cursor: null | DateTime;

    constructor(begin: DateTime, interval: DateInterval, end: DateTime | number, options?: number) {
        this.begin = begin;
        this.interval = interval instanceof DateInterval ? interval : new DateInterval(interval);

        if (options === DatePeriod.EXCLUDE_START_DATE)
            this.begin = begin.add(interval);

        if (typeof end === 'number') {
            end = Math.abs(end);
            end = begin.add(<DateInterval>{
                y: interval.y * end,
                m: interval.m * end,
                d: interval.d * end,
                h: interval.h * end,
                i: interval.i * end,
                s: interval.s * end,
                invert: interval.invert
            });
        }

        /**
            *
            * @type {DateTime}
            */
        this.end = end;
        this._cursor = null;

    }

    valid() {
        return this._cursor && this._cursor.valueOf() <= this.end.valueOf();
    }

    next() {
        if(this._cursor)
            this._cursor = this._cursor.add(this.interval);
    }

    current() {
        return this._cursor;
    }

    key() {
        return this._cursor ? this._cursor.valueOf() : '';
    }

    rewind() {
        this._cursor = this.begin;
    }

}

/**
* 和暦操作
*/
var JAPAN_ERA = {

    REIWA:
        new DateTime(new Date(2019, 5, 1)),
    HEISEI:
        new DateTime(new Date(1989, 0, 8)),
    SHOWA:
        new DateTime(new Date(1926, 11, 25)),
    TAISHO:
        new DateTime(new Date(1912, 6, 30)),
    MEIJI:
        new DateTime(new Date(1868, 9, 23)),

	/**
		*
		* @param {Date} date
		* @return {*}
		*/
    translate: function (date: Date) {
        var era_list, index, era;
        era_list = [this.HEISEI, this.SHOWA, this.TAISHO, this.MEIJI];

        const short_name = 'RHSTM';
        for (index = 0; index < era_list.length; index++) {
            era = era_list[index];
            if(era.valueOf() <= date.valueOf())
                return short_name[index] + (date.getFullYear() - <number>era.format('Y'));
        }
        return null;
    }

};


export default function datetime(arg: any, ...args : number[]) {
    return new DateTime(arg, ...args);
}

datetime.DateTime = DateTime;
datetime.DateInterval = DateInterval;
datetime.DatePeriod = DatePeriod;
datetime.DateTransform = DateTransform;
datetime.JAPAN_ERA = JAPAN_ERA;

datetime.diff = function (a: DateTime, b: DateTime, absolute: boolean) {
    var time = a.valueOf() - b.valueOf();
    var date = new Date(Math.abs(time));
    var result = new DateInterval();
    result.days = Math.ceil(time / 86400000);
    result.invert = (time < 0 && absolute !== true) ? 1 : 0;
    result.y = date.getFullYear() - 1970;
    result.m = date.getMonth();
    result.d = date.getDate() - 1;
    result.h = date.getHours(); // タイムゾーンオフセットによる影響あり
    result.m = date.getMinutes();
    result.s = date.getSeconds();
    return result;
};

/**
    *
    * @param {DateTime} datetime_object
    * @param {DateInterval} interval
    * @returns {DateTime}
    */
datetime.add = function (datetime_object: DateTime, interval: DateInterval) {
    var op = interval.invert
        ? { y: -interval.y, m: -interval.m, d: -interval.d, h: -interval.h, i: -interval.i, s: -interval.s }
        : interval;
    var date = datetime_object.toDate();
    if (op.y || op.m || op.d)
        date.setFullYear(date.getFullYear() + op.y, date.getMonth() + op.m, date.getDate() + op.d);
    if (op.h || op.i || op.s)
        date.setHours(date.getHours() + op.h, date.getMinutes() + op.i, date.getSeconds() + op.s);
    return new DateTime(date);
};

datetime.sub = function (datetime_object: DateTime, interval: DateInterval) {
    var invert, result;
    invert = interval.invert;
    interval.invert = invert ? 0 : 1;
    result = datetime.add(datetime_object, interval);
    interval.invert = invert;
    return result;
};

/**
 * タイムゾーンオブジェクトを設定する(DateTimezoneはコスト高のため実装しない)
 */
datetime.setTimezone = function (tz: { id: string, abbr: string }) {
    if (!tz.id || !tz.abbr)
        throw new Error('timezone must has id & abbr properties');
    DateTransform.timezone = tz;
};

