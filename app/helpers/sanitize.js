import { helper } from 'ember-helper';
import filterXSS from 'npm:xss';
import { htmlSafe } from 'ember-string';


export function sanitize(html) {
    function unitProp(name) {
        return new RegExp(name + ":\\s*[0-9]+(?:\\.[0-9]+)?(?:em|px|in|cm|%);?", 'g');
    }

    var xss = new filterXSS.FilterXSS({

        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script', 'link'],

        safeAttrValue: function (tag, name, value) {

            var tagAttr = tag + '[' + name + ']';

            switch (tagAttr) {
                case 'img[src]':
                    if (value.substr(0, 11) === 'data:image/')
                        return value;
                    break;
            }

            return filterXSS.safeAttrValue(tag, name, value);
        },
        onIgnoreTagAttr: function onIgnoreTagAttr(tag, name, value, isWhiteAttr) {
            var tagAttr = tag + '[' + name + ']';

            switch (tagAttr) {
                case 'div[style]':
                    value = value.replace(unitProp('width'), '');
                    break;
                case 'img[style]':
                    value = value
                        .replace(unitProp('width'), 'width: 100%;')
                        .replace(unitProp('height'), '');
            }

            if (name === 'style' || name === 'class')
                return name + '="' + filterXSS.escapeAttrValue(value) + '"';

            return filterXSS.onIgnoreTagAttr(tag, name, value, isWhiteAttr);
        }
    });

    html = xss.process(html);

    return htmlSafe(html);

}

export default helper(sanitize);
