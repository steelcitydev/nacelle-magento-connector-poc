import config, { connector } from '../../../../config/app'

export default async (req, res) => {
  const { debug: d } = req.allParams();
  const debug = d || config.debug;

  try {
    const { limit } = req.body
    // Explicitly select the params we want to use from the validatedHeaders object
    const {
      sourceDomain,
      xNacelleSpaceId,
      xNacelleSpaceToken,
      magentoHost,
      magentoToken
    } = req.getValidatedHeaders()

    // Schedule a jobe to run immediately to fetch the Magento Products concurrently
    const job = connector.jobs.schedule('fetch-products-magento', {
      magentoHost,
      magentoToken,
      xNacelleSpaceId,
      xNacelleSpaceToken,
      sourceDomain,
      limit
    })

    if(debug) {
      job.on('done', results => {
        connector.logger('controller.index.products');
        connector.logger(results);
      });
      job.on('error', e => {
        connector.logger('controllers.index.products:error', e);
      });
    }
    
    return res.status(200).send('Indexing in progress!')
  } catch (e) {
    return res.status(400).send(e)
  }

}