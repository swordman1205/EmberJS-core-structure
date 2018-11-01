import moment from 'moment';
import { helper } from 'ember-helper';

export function formatDate([date, format]) {
    if (format) {
      return moment(date).format(format);
    }
    if (moment(date).isAfter(moment().startOf('day'))) {
        return moment(date).format('HH:mm');
    }
    if (moment(date).isAfter(moment().startOf('week'))) {
        return moment(date).format('dddd D');
    }
    if (moment(date).isAfter(moment().startOf('month'))) {
        return moment(date).format('MMM D');
    }
    else {
        return moment(date).format('MMMM D, YYYY');
    }
}

export default helper(formatDate);
