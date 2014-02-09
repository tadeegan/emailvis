import mailbox
import email
import re
import time
import csv
from email.utils import parsedate


MBOX = 'mail.mbox'

mbox = mailbox.mbox(MBOX)

email = 'tadeegan@gmail.com'

def extract_date(email):
    date = email['Date']
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

out = []

for message in array:
    subject = message['subject']
    subject = regex.sub('', str(subject))
    if subject == "":
        continue
    if email in str(message['to']):
        lookup_table[subject] = message
    else:
        if not (subject in lookup_table):
            continue
        else:
            prev_mes = lookup_table[subject]
            sent_time = time.mktime(extract_date(prev_mes))
            resp_time = time.mktime(extract_date(message))
            diff =  resp_time - sent_time
            out.append((sent_time, diff, "content"))

with open('tsv.tsv', 'wb') as tsvfile:
	csvwriter = csv.writer(tsvfile, delimiter='\t') 
	for blah in out:
		csvwriter.writerow(blah)
