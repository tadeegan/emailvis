import mailbox
import email
import json
from email.utils import parsedate


def extract_date(email):
    date = email.get('Date')
    return parsedate(date)


MBOX = 'smallmail.mbox'

mbox = mailbox.mbox(MBOX)

sorted_mails = sorted(mbox, key=extract_date)
mbox.update(enumerate(sorted_mails))
mbox.flush()
