import { connector } from '../../../../config/app'

export default async (req, res) => {

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

    // Schedule a jobe to run immediately to fetch the Magento Categories concurrently
    connector.jobs.schedule('fetch-categories-magento', {
      magentoHost,
      magentoToken,
      xNacelleSpaceId,
      xNacelleSpaceToken,
      sourceDomain,
      limit
    })

    return res.status(200).send('Indexing in Progress')
  } catch (e) {
    return res.status(400).send(e)
  }

}
