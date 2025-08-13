let extractedData = null;

document.addEventListener('DOMContentLoaded', function() {
  const extractBtn = document.getElementById('extract');
  const exportJsonBtn = document.getElementById('exportJson');
  const exportCsvBtn = document.getElementById('exportCsv');
  const statusDiv = document.getElementById('status');
  const dataPreviewDiv = document.getElementById('dataPreview');

  extractBtn.addEventListener('click', extractData);
  exportJsonBtn.addEventListener('click', () => exportData('json'));
  exportCsvBtn.addEventListener('click', () => exportData('csv'));

  async function extractData() {
    try {
      extractBtn.disabled = true;
      showStatus('Extracting data...', 'info');

      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      const response = await chrome.tabs.sendMessage(tab.id, {action: 'extractStandings'});
      
      if (response.success && response.data && response.data.length > 0) {
        extractedData = response.data;
        showStatus(`Successfully extracted ${extractedData.length} player records`, 'success');
        showDataPreview(extractedData);
        exportJsonBtn.disabled = false;
        exportCsvBtn.disabled = false;
      } else {
        showStatus('No tournament standings found on this page', 'error');
        extractedData = null;
        exportJsonBtn.disabled = true;
        exportCsvBtn.disabled = true;
      }
    } catch (error) {
      console.error('Error:', error);
      showStatus('Error extracting data. Make sure you\'re on a tournament page.', 'error');
      extractedData = null;
      exportJsonBtn.disabled = true;
      exportCsvBtn.disabled = true;
    } finally {
      extractBtn.disabled = false;
    }
  }

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
  }

  function showDataPreview(data) {
    const preview = data.slice(0, 5).map(player => 
      `<div class="player-row">
        <strong>#${player.ranking}</strong> ${player.username} 
        (${player.memberNumber}) - ${player.winPoints} pts
      </div>`
    ).join('');
    
    dataPreviewDiv.innerHTML = preview + 
      (data.length > 5 ? `<div style="text-align: center; margin-top: 10px;">...and ${data.length - 5} more players</div>` : '');
    dataPreviewDiv.style.display = 'block';
  }

  function exportData(format) {
    if (!extractedData) return;

    let content, filename, mimeType;

    if (format === 'json') {
      content = JSON.stringify(extractedData, null, 2);
      filename = `tournament-standings-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else if (format === 'csv') {
      const headers = ['Ranking', 'Username', 'Member Number', 'Win Points', 'OMW', 'OOMW'];
      const csvRows = [
        headers.join(','),
        ...extractedData.map(player => [
          player.ranking,
          `"${player.username}"`,
          player.memberNumber,
          player.winPoints,
          player.omw,
          player.oomw
        ].join(','))
      ];
      content = csvRows.join('\n');
      filename = `tournament-standings-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: filename
    }, (downloadId) => {
      if (downloadId) {
        showStatus(`${format.toUpperCase()} file downloaded successfully`, 'success');
      } else {
        showStatus(`Error downloading ${format.toUpperCase()} file`, 'error');
      }
      URL.revokeObjectURL(url);
    });
  }
});