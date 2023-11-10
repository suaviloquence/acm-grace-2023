from dataclasses import dataclass

@dataclass
class Events(object):
    eventName = str
    # list of users is the data for the users involved?
    eventCollab = list = []
    date = int
    location = tuple

    # group chat and photo need to be implemented later
