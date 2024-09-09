import * as yup from 'yup'

const messageSchema = yup.object().shape({
  subject: yup.string().required("Required"),
  title: yup.string().required("Required"),
  message: yup.string().required("Required")
})

export default messageSchema