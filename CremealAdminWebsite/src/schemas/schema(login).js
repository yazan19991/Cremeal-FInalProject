import * as yup from 'yup'

const basicSchema = yup.object().shape({
  email: yup.string(),
  password: yup.string().required("Required")
})

export default basicSchema