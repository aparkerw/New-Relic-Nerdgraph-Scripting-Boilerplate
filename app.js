import "dotenv/config.js";
import NerdGraphService from "./services/NerdGraphService.js";

const main = async () => {

  let accounts = await NerdGraphService.getAccounts();

  for(let account of accounts) {
    console.log('loading consumption for ', account.name);
    const accountId = account.id;
    let results = await NerdGraphService.runNRQL('FROM NrComputeUsage SELECT sum(usage) AS CCU SINCE 30 days ago', [accountId])
    console.log(`the ingest for ${account.name} (${accountId}) was ${results[0].CCU} for the past day`);
  }


  // here is a sample where we can loop over GUIDs (statically provided) and we can
  // perform a mutation on them, here it's to update the GUID for the private location
  let syntheticGuids = getGuidsToUpdate();
  let privateLocationGuid = 'SOME-PRIVATE-LOCATION-GUID';
  for (let guid of syntheticGuids) {
    console.log('updating synthetic', guid);
    let someData = await NerdGraphService.updateSyntheticPrivateLocation(guid, privateLocationGuid);
    console.log('updated', someData?.name)
  }
}

const getGuidsToUpdate = () => {
  return [
    'MjgyN-SYNTHETIC-GUID-1-WY3MA',
    'MjgyN-SYNTHETIC-GUID-2-WY3MA',
    'MjgyN-SYNTHETIC-GUID-3-WY3MA',
  ];
}

main();
