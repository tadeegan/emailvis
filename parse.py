import mailbox
import re
import time
import csv
import sys
from email.utils import parsedate


MBOX = sys.argv[1]
email = sys.argv[2]

print MBOX
print email

mbox = mailbox.mbox(MBOX)

def extract_date(email):
    date = email['Date']
    return parsedate(date)

sorted_mails = sorted(mbox, key=extract_date)
mbox.update(enumerate(sorted_mails))
mbox.flush()

array = []

lookup_table = dict()

for key, message in mbox.iteritems():
    array.append(message)

array.sort(key=extract_date)

regex = re.compile(re.escape('re: '), re.IGNORECASE)
no_subj = re.compile(re.escape('(no subject)'), re.IGNORECASE)
newlines = re.compile(re.escape('[,.?!\t\n]+'))

out = []

for message in array:
    subject = message['subject']
    subject = regex.sub('', str(subject))
    if (subject is None) or (subject == "") or (subject == "None"):
        continue
    if no_subj.search(subject) is not None:
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
            contents = ""
            for part in message.walk():
              if part.get_content_type() == 'text/plain':
                contents+=(newlines.sub(' ',  part.get_payload()))
            out.append((sent_time, diff, ("Important" in str(message['X-Gmail-Labels'])), contents))

with open('tsv.tsv', 'wb') as tsvfile:
	csvwriter = csv.writer(tsvfile, delimiter='\t') 
	for blah in out:
		csvwriter.writerow(blah)
