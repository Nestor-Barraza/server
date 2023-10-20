import { Router, Request, Response } from "express";
import axios from "axios"
import jsonwebtoken from 'jsonwebtoken'
import { PARITY_SERVER, JWT_SECRET } from "../constants";
import dotenv from 'dotenv';
dotenv.config()

export const authRoute = Router();

authRoute.post('/login', async (req: Request, res: Response) => {
  const jwt = req.headers.authorization
  if (!jwt) {
    return res.status(401).json({ message: 'token is wrong' })
  }
  const payload = jsonwebtoken.decode(jwt) as { user_id?: string }
  console.log({payload})
  const uid = payload.user_id
  try {
    const response = await axios.get(`${PARITY_SERVER}/streaming-auth/check-loggin`, {
      headers: {
        Authorization: jwt,
        uid: uid || ""
      }
    })

    console.log({response, jwt, uid})

    const { email, role } = response.data as { message: string, role: string, email: string }

    const token = jsonwebtoken.sign({ uid, email, role }, JWT_SECRET, { expiresIn: '10y' })
    return res.json({
      token,
      role,
      email,
      message: `${response.data.role} is logged in sucessfully`
    })
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: 'token is wrong' })
  }
});
