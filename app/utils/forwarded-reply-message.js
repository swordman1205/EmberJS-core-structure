import _ from 'lodash';

export default class ForwardedReplyMessage {
  generate(reply) {
    let pos = 0;
    let pieces = ['<br/>'];
    const replies = reply.get('discussion.replies');

    if (!replies) {
      return '';
    }

    while (reply.get('id') !== replies.objectAt(pos).get('id')) {
      ++pos;
    }

    for (let i = 0; i <= pos; ++i) {
      reply = replies.objectAt(i);
      pieces = pieces.concat([
        '<hr/>',
        '<div>Subject: ' + reply.get('subject') + '</div>',
        '<div>From:' + reply.get('sender.name') + '</div>',
        '<div>Date: ' + reply.get('date') + '</div>',
        '<div>To: ' + reply.get('publicRecipients').mapBy('name').join(', ') + '</div>',
        '<div>Copy: ' + reply.get('copyRecipients').mapBy('name').join(', ') + '</div>',
        reply.get('message')
      ]);
    }

    const hrbr = '<hr/><br/>';

    if (pieces.length && _.last(pieces).slice(-hrbr.length) !== hrbr) {
      pieces.push(hrbr);
    }

    return pieces.join('');
  }
}
