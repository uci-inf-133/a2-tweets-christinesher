function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;
	
	const dates = tweet_array.map(tweet => tweet.time);
	const earliestDate = new Date(Math.min(...dates));
	const latestDate = new Date(Math.max(...dates));
	
	const firstDateFormatted = earliestDate.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC'
	});
	const lastDateFormatted = latestDate.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC'
	});
	
	document.getElementById('firstDate').innerText = firstDateFormatted;
	document.getElementById('lastDate').innerText = lastDateFormatted;
	
	let completedEvents = 0;
	let liveEvents = 0;
	let achievements = 0;
	let miscellaneous = 0;
	let writtenCompletedEvents = 0;
	
	tweet_array.forEach(tweet => {
		const source = tweet.source;
		if (source === 'completed_event') {
			completedEvents++;
			if (tweet.written) {
				writtenCompletedEvents++;
			}
		} else if (source === 'live_event') {
			liveEvents++;
		} else if (source === 'achievement') {
			achievements++;
		} else {
			miscellaneous++;
		}
	});
	
	const totalTweets = tweet_array.length;
	const completedEventsPct = (completedEvents / totalTweets * 100).toFixed(2);
	const liveEventsPct = (liveEvents / totalTweets * 100).toFixed(2);
	const achievementsPct = (achievements / totalTweets * 100).toFixed(2);
	const miscellaneousPct = (miscellaneous / totalTweets * 100).toFixed(2);
	const writtenPct = (writtenCompletedEvents / completedEvents * 100).toFixed(2);
	
	document.querySelectorAll('.completedEvents').forEach(el => el.innerText = completedEvents);
	document.querySelectorAll('.completedEventsPct').forEach(el => el.innerText = completedEventsPct + '%');
	document.querySelectorAll('.liveEvents').forEach(el => el.innerText = liveEvents);
	document.querySelectorAll('.liveEventsPct').forEach(el => el.innerText = liveEventsPct + '%');
	document.querySelectorAll('.achievements').forEach(el => el.innerText = achievements);
	document.querySelectorAll('.achievementsPct').forEach(el => el.innerText = achievementsPct + '%');
	document.querySelectorAll('.miscellaneous').forEach(el => el.innerText = miscellaneous);
	document.querySelectorAll('.miscellaneousPct').forEach(el => el.innerText = miscellaneousPct + '%');
	document.querySelectorAll('.written').forEach(el => el.innerText = writtenCompletedEvents);
	document.querySelectorAll('.writtenPct').forEach(el => el.innerText = writtenPct + '%');
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});