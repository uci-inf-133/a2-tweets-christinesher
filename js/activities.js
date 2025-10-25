function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	const completedTweets = tweet_array.filter(tweet => tweet.source === 'completed_event');
	
	const activityCounts = {};
	completedTweets.forEach(tweet => {
		const activityType = tweet.activityType;
		if (activityType !== 'unknown') {
			activityCounts[activityType] = (activityCounts[activityType] || 0) + 1;
		}
	});
	
	const sortedActivities = Object.entries(activityCounts)
		.sort(([,a], [,b]) => b - a)
		.slice(0, 3);
	
	document.getElementById('numberActivities').innerText = Object.keys(activityCounts).length;
	
	if (sortedActivities.length >= 3) {
		document.getElementById('firstMost').innerText = sortedActivities[0][0];
		document.getElementById('secondMost').innerText = sortedActivities[1][0];
		document.getElementById('thirdMost').innerText = sortedActivities[2][0];
	} else {
		console.error('Not enough activities found:', sortedActivities.length);
	}
	
	const activityData = Object.entries(activityCounts).map(([activity, count]) => ({
		activity: activity,
		count: count
	}));

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityData
	  },
	  "mark": "bar",
	  "encoding": {
	    "x": {"field": "activity", "type": "nominal", "sort": "-y"},
	    "y": {"field": "count", "type": "quantitative"}
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	const topThreeActivities = sortedActivities.map(([activity]) => activity);
	const distanceData = completedTweets
		.filter(tweet => topThreeActivities.includes(tweet.activityType))
		.map(tweet => ({
			activity: tweet.activityType,
			distance: tweet.distance,
			dayOfWeek: tweet.time.toLocaleDateString('en-US', { weekday: 'long' })
		}));

	distance_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Distance by day of week for top 3 activities",
	  "data": {
	    "values": distanceData
	  },
	  "mark": "point",
	  "encoding": {
	    "x": {"field": "dayOfWeek", "type": "ordinal", "sort": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]},
	    "y": {"field": "distance", "type": "quantitative"},
	    "color": {"field": "activity", "type": "nominal"}
	  }
	};
	vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});

	const aggregatedData = [];
	topThreeActivities.forEach(activity => {
		['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
			const dayData = distanceData.filter(d => d.activity === activity && d.dayOfWeek === day);
			if (dayData.length > 0) {
				const avgDistance = dayData.reduce((sum, d) => sum + d.distance, 0) / dayData.length;
				aggregatedData.push({
					activity: activity,
					dayOfWeek: day,
					avgDistance: avgDistance
				});
			}
		});
	});

	distance_vis_aggregated_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Average distance by day of week for top 3 activities",
	  "data": {
	    "values": aggregatedData
	  },
	  "mark": "bar",
	  "encoding": {
	    "x": {"field": "dayOfWeek", "type": "ordinal", "sort": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]},
	    "y": {"field": "avgDistance", "type": "quantitative"},
	    "color": {"field": "activity", "type": "nominal"}
	  }
	};
	vegaEmbed('#distanceVisAggregated', distance_vis_aggregated_spec, {actions:false});

	let longestActivity = '';
	let shortestActivity = '';
	let maxDistance = 0;
	let minDistance = Infinity;
	
	topThreeActivities.forEach(activity => {
		const activityData = distanceData.filter(d => d.activity === activity);
		const avgDistance = activityData.reduce((sum, d) => sum + d.distance, 0) / activityData.length;
		
		if (avgDistance > maxDistance) {
			maxDistance = avgDistance;
			longestActivity = activity;
		}
		if (avgDistance < minDistance) {
			minDistance = avgDistance;
			shortestActivity = activity;
		}
	});
	
	const weekdayData = distanceData.filter(d => {
		const day = d.dayOfWeek;
		return day === 'Monday' || day === 'Tuesday' || day === 'Wednesday' || day === 'Thursday' || day === 'Friday';
	});
	const weekendData = distanceData.filter(d => {
		const day = d.dayOfWeek;
		return day === 'Saturday' || day === 'Sunday';
	});
	
	const weekdayAvg = weekdayData.reduce((sum, d) => sum + d.distance, 0) / weekdayData.length;
	const weekendAvg = weekendData.reduce((sum, d) => sum + d.distance, 0) / weekendData.length;
	
	document.getElementById('longestActivityType').innerText = longestActivity;
	document.getElementById('shortestActivityType').innerText = shortestActivity;
	document.getElementById('weekdayOrWeekendLonger').innerText = weekdayAvg > weekendAvg ? 'weekdays' : 'weekends';
	
	let showingAggregated = false;
	const aggregateButton = document.getElementById('aggregate');
	const distanceVisDiv = document.getElementById('distanceVis');
	const distanceVisAggregatedDiv = document.getElementById('distanceVisAggregated');
	
	distanceVisAggregatedDiv.style.display = 'none';
	
	aggregateButton.addEventListener('click', function() {
		showingAggregated = !showingAggregated;
		if (showingAggregated) {
			distanceVisDiv.style.display = 'none';
			distanceVisAggregatedDiv.style.display = 'block';
			this.innerText = 'Show all activities';
		} else {
			distanceVisDiv.style.display = 'block';
			distanceVisAggregatedDiv.style.display = 'none';
			this.innerText = 'Show means';
		}
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});