let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	writtenTweets = tweet_array.filter(tweet => tweet.written);
}

function addEventHandlerForSearch() {
	const searchBox = document.getElementById('textFilter');
	const searchCount = document.getElementById('searchCount');
	const searchText = document.getElementById('searchText');
	const tweetTable = document.getElementById('tweetTable');
	
	searchCount.innerText = '0';
	searchText.innerText = '';
	
	searchBox.addEventListener('input', function() {
		const searchTerm = this.value;
		
		searchText.innerText = searchTerm;
		tweetTable.innerHTML = '';
		
		if (searchTerm === '') {
			searchCount.innerText = '0';
			return;
		}
		
		const filteredTweets = writtenTweets.filter(tweet => 
			tweet.writtenText.toLowerCase().includes(searchTerm.toLowerCase())
		);
		
		searchCount.innerText = filteredTweets.length;
		
		filteredTweets.forEach((tweet, index) => {
			const row = tweet.getHTMLTableRow(index + 1);
			tweetTable.insertAdjacentHTML('beforeend', row);
		});
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});