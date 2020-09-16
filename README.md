# DokiBot

What started out as a fun gag with friends to keep track of so-called 'poems' has developed into a full-fledged Discord bot! If you enjoyed the game Doki Doki Literature Club, this bot is for you. It has been mostly used as a learning experience for me, but feel free to add the bot to your server if any of these features interest you.

# Features
### Doki-Poems
Make a channel called doki-poems and DokiBot will grab the first word said every minute/hour/day.
 
### Insults
Randomly throughout the day, DokiBot will mention someone and have a special message for them. (This is automatically **OFF** due to some insults containing adult-oriented language. Enable it on your server with -toggle)

### Other Features
There are a bunch of other small Easter eggs that are being implemented as DokiBot's development continues.

# Commands

## Poems
### -end
Ends the current poem.*

### -frequency \<time\>
Changes the frequency DokiBot grabs words for her poem.*
* **\<time\>**: minute, hour, day

---

## Insults
### -submit \<insult\>
Submits an insult to DokiBot. Must include at least one `%user%` where DokiBot will randomly mention someone.

### -toggle
Turns on/off randoms insults.*

---

## Fun
### -anime \<title\>
Finds info on the given anime.

### -moniquote
Posts a random Monika quote from the end of DDLC.

---

## Images
### -doki \[tags\]
Posts an image of a Doki girl, with up to 5 specified tags.
* **\[tags\]**: nsfw, 1girl, 2girls, multiple, monika, sayori, yuri, natsuki

### -waifu \[tags\]
Posts an image of a random waifu, with up to 5 specified tags (more coming soon!).
* **\[tags\]**: nsfw, 1girl, 2girls, multiple

### -neko \[tags\]
Posts an image of a beautiful neko girl, with up to 2 specified tags.
* **\[tags\]**: nsfw, gif

---

## Sounds
### -nep \[character\]
Plays a soundclip from Hyperdimension Neptunia (more coming soon!).
* **\[character\]**: neptune, vert, noire, blanc, nepgear, uni, rom, ram, if, compa

---

## OST
### -play \<number\>
Plays a track from the DDLC OST, #1-15.

### -playall
Queues all tracks from the DDLC OST.

### -list
Lists all songs from the DDLC OST and their corresponding numbers.

### -stop
Stops the current song and clears the queue.

### -pause
Pauses the current song.

### -resume
Resumes a paused song.

### -skip
Skips the current song.

### -queue \[page num\]
Displays the song queue.

### -clear
Wipes the entire queue.

---

## Miscellaneous
### -help \[command\]
Lists all commands or info about a specific command.

### -setchannel \[channel\]
Changes the default channel DokiBot will post insults and other messages to.*

### -prefix \<new prefix\>
Changes the prefix used for DokiBot commands.*

### -vote
Posts a voting link for DokiBot. Voting resets any active cooldowns!

---

\*Requires Manage Server perms
