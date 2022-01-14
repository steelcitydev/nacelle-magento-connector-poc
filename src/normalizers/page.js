import { slugify } from '../utils/stringHelpers'
import { getSeconds } from '../utils/dateHelpers'

export default ({
  id: cmsSyncSourceContentId,
  identifier,
  title,
  content,
  creation_time,
  update_time
}, {
  locale
}) => {

  return {
    handle: slugify(identifier),
    cmsSyncSourceContentId,
    locale,
    type: 'page',
    title,
    content,
    description: content,
    createdAt: getSeconds(creation_time),
    updatedAt: getSeconds(update_time)
  }
}