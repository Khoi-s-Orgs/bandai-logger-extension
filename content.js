function extractStandingsData() {
  const standingsWrapper = document.querySelector('.standingList-wrapper');
  
  if (!standingsWrapper) {
    return null;
  }
  
  const table = standingsWrapper.querySelector('table.standingList');
  if (!table) {
    return null;
  }
  
  const rows = table.querySelectorAll('tbody tr');
  const standings = [];
  
  rows.forEach(row => {
    const rankElement = row.querySelector('.rank .rank-frame');
    const userDataElement = row.querySelector('.userData');
    const pointElement = row.querySelector('.point');
    const oppElements = row.querySelectorAll('.opp');
    
    if (rankElement && userDataElement && pointElement && oppElements.length >= 2) {
      const ranking = rankElement.textContent.trim();
      const nameElement = userDataElement.querySelector('.name');
      const numberElement = userDataElement.querySelector('.number');
      
      const username = nameElement ? nameElement.textContent.trim() : '';
      const memberNumberText = numberElement ? numberElement.textContent.trim() : '';
      const memberNumber = memberNumberText.replace('Member Number ', '');
      
      const winPoints = pointElement.textContent.trim();
      const omw = oppElements[0].textContent.trim();
      const oomw = oppElements[1].textContent.trim();
      
      standings.push({
        ranking: parseInt(ranking),
        username: username,
        memberNumber: memberNumber,
        winPoints: parseInt(winPoints),
        omw: omw,
        oomw: oomw
      });
    }
  });
  
  return standings;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractStandings') {
    const data = extractStandingsData();
    sendResponse({success: true, data: data});
  }
});

window.standingsExtractor = {
  extract: extractStandingsData
};