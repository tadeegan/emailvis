import mailbox
import email
import re
from email.utils import parsedate


MBOX = 'smallmail.mbox'

mbox = mailbox.mbox(MBOX)


def extract_date(email):

    date = email['Date']
    print date
    return parsedate(date)

sorted_mails = sorted(mbox, key=extract_date)
mbox.update(enumerate(sorted_mails))
mbox.flush()

array = []

lookup_table = dict()

for key , message in mbox.iteritems():
    array.append(message)

array.sort(key=extract_date)

regex = re.compile(re.escape('re: '), re.IGNORECASE)
for message in array:
    subject = message['subject']
    subject = regex.sub('', str(subject))

    lookup_table[subject] = message
    #print message['subject']
    #print message['to']
    #print message['from']
    #print message.get_flags()
    #print message['Date']