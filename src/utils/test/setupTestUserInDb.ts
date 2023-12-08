import { isDbActive } from '../../services/db/isDbActive'
import { dockerComposeUp } from '../../../scripts/dockerComposeUp'
import { dockerComposeDown } from '../../../scripts/dockerComposeDown'
import { createUserTable } from '../../services/db/createUserTable'
import { dbClient } from '../../services/db/dbClient'
import {
  TEST_PASSWORD_HASH,
  TEST_USERNAME,
  TEST_USER_ID,
  TEST_USER_PASSWORD_SALT
} from './constants'
import { pause } from './pause'

const isTestEnv = true
export const setupTestUserInDb = async () => {
  if (!(await isDbActive())) {
    dockerComposeUp(isTestEnv).stdout?.pipe(process.stdout)
    await pause(2000) //2s is the smallest amount of time for db to start up
    await setupTestData()
    await pause(1000)
  } else {
    dockerComposeDown()
    await pause(1000)
    await setupTestUserInDb()
  }
}

const setupTestData = async () => {
  try {
    await createUserTable()
    await dbClient.query(
      `INSERT INTO USERS(user_id, email, hashed_password, salt ) VALUES(:user_id, :email, :hashed_password, :salt)`,
      {
        replacements: {
          user_id: TEST_USER_ID,
          email: TEST_USERNAME,
          hashed_password: TEST_PASSWORD_HASH,
          salt: TEST_USER_PASSWORD_SALT
        }
      }
    )
  } catch (err) {
    console.info('aaaa error', err)
  }
}

export const tearDownTestDb = async () => {
  dockerComposeDown()
  await pause(1000)
}
