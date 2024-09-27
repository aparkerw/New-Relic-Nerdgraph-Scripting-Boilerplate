import axios from "axios";

const headers = () => {
  if(!process.env.NR_API_KEY) {
    console.error("THERE IS NO API KEY DEFINED!!!");
    console.error("set ENV variable NR_API_KEY, or create a .env file with NR_API_KEY specified");
  }
  return {
    "API-Key": process.env.NR_API_KEY,
    "Content-Type": "application/json",
    Accept: 'application/json',
    'Accept-Charset': 'utf-8',
    "Access-Control-Allow-Origin": "http://localhost:3000/",
    "Access-Control-Allow-Methods": "POST",
    "charset": "UTF-8",
  };
}

const runNRQL = async (nrql, accounts) => {
  var graphql_query = {
    query: `
        {
            actor {
              nrql(query: "${nrql}", accounts: [${accounts.join(', ')}], timeout: 120) {
                results
                totalResult
              }
            }
          }`,
    variables: {}
  }
  var resp = await makeCall(graphql_query);

  if (!resp.data.data.actor.nrql || resp.data.data.actor.nrql.results.length == 0) {
    console.log("Failed on this:::", accounts, nrql);
  }
  return resp?.data?.data?.actor?.nrql?.results;
}

const getAccounts = async () => {
  var graphql = { query: "{\n  actor {\n    accounts {\n      id\n      name\n   reportingEventTypes\n    }\n  }\n}", variables: null };
  let resp = await makeCall(graphql);
  return resp?.data?.data?.actor?.accounts;
}

const getEntityGuidFromName = async (entityName, accountId, type) => {
  // entitySearch(queryBuilder: {name: "${entityName}" ${type ? `, type: ${type}` : ''}}) {
  let entities = await getEntitiesFromQuery(`name = '${entityName}' and accountId = ${accountId}`)

  if (entities.length > 1) {
    throw Error(`There are too many entities with that name. ${entities.map(e => e.guid).join(', ')}`);
  } else if (!entities || entities.length === 0) {
    throw Error("Entities with that name could not be found.");
  }
  return entities[0]?.guid;
}

const getEntitiesFromQuery = async (query) => {
  // entitySearch(queryBuilder: {name: "${entityName}" ${type ? `, type: ${type}` : ''}}) {
  var graphql = {
    query: `{
    actor {
      entitySearch(query: "${query}") {
        results {
          entities {
            guid
            type
            name
          }
        }
        query
      }
    }
  }`};

  let resp = await makeCall(graphql);
  let entities = resp.data?.data?.actor?.entitySearch?.results?.entities;
  return entities;
}

const updateSyntheticPrivateLocation = async (guid, privateLocationGuid) => {
  var graphql = { query: `mutation {
  syntheticsUpdateSimpleMonitor(
    guid: "${guid}"
    monitor: {locations: {private: "${privateLocationGuid}"}}
  ) {
    monitor {
      modifiedAt
      name
      status
      uri
    }
  }
}`, variables: null };
  let resp = await makeCall(graphql);
  return resp?.data?.data?.syntheticsUpdateSimpleMonitor?.monitor;
}

const makeCall = async (graphql) => {

  var resp = await axios({
    url: 'https://api.newrelic.com/graphql',
    method: 'post',
    headers: headers(),
    data: graphql
  }).catch((e) => {
    console.log('GraphQL alert condition create error:', JSON.stringify(e, null, 2));
  });

  return resp;
}


export default { makeCall, runNRQL, getAccounts, getEntityGuidFromName, getEntitiesFromQuery, updateSyntheticPrivateLocation };
