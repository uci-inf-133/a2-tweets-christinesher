class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        if (this.text.includes("Just completed") || this.text.includes("Just posted")) {
            return "completed_event";
        }
        if (this.text.includes("Just started") || this.text.includes("Currently") || this.text.includes("Now")) {
            return "live_event";
        }
        if (this.text.includes("New PB") || this.text.includes("Personal best") || this.text.includes("achievement") || 
            this.text.includes("goal") || this.text.includes("milestone") || this.text.includes("record")) {
            return "achievement";
        }
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        if (this.text.includes(' - ')) {
            return true;
        }
        if (this.text.includes('with @Runkeeper. Check it out!')) {
            return false;
        }
        return false;
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        const dashIndex = this.text.indexOf(' - ');
        if (dashIndex !== -1) {
            let userText = this.text.substring(dashIndex + 3);
            userText = userText.replace(/https:\/\/t\.co\/\w+/g, '').trim();
            userText = userText.replace(/#RunKeeper/g, '').trim();
            return userText;
        }
        return "";
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        const text = this.text.toLowerCase();
        
        if (text.includes(' run ') || text.includes('run with') || text.includes('km run') || text.includes('mi run')) {
            return "running";
        } else if (text.includes(' walk') || text.includes('walk ') || text.includes('km walk') || text.includes('mi walk')) {
            return "walking";
        } else if (text.includes(' bike') || text.includes('bike ') || text.includes('km bike') || text.includes('mi bike') || text.includes('cycling')) {
            return "cycling";
        } else if (text.includes('hike') || text.includes('hiking')) {
            return "hiking";
        } else if (text.includes('swim') || text.includes('swimming')) {
            return "swimming";
        } else if (text.includes('ski') || text.includes('skiing')) {
            return "skiing";
        } else if (text.includes('yoga')) {
            return "yoga";
        } else if (text.includes('workout') || text.includes('training')) {
            return "workout";
        } else {
            return "other";
        }
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        const text = this.text;
        const kmMatch = text.match(/(\d+\.?\d*)\s*km/);
        const miMatch = text.match(/(\d+\.?\d*)\s*mi/);
        
        if (kmMatch) {
            const km = parseFloat(kmMatch[1]);
            return km * 0.621371;
        } else if (miMatch) {
            return parseFloat(miMatch[1]);
        }
        
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        const activityType = this.activityType;
        const linkMatch = this.text.match(/https:\/\/t\.co\/\w+/);
        const link = linkMatch ? linkMatch[0] : "#";
        
        return `<tr>
            <td>${rowNumber}</td>
            <td>${activityType}</td>
            <td><a href="${link}" target="_blank">${this.text}</a></td>
        </tr>`;
    }
}