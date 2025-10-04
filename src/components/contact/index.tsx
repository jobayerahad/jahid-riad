import { Element } from 'react-scroll'
import {
  Container,
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Stack,
  Group,
  ActionIcon,
  Anchor,
  SimpleGrid
} from '@mantine/core'
import { motion } from 'framer-motion'
import { useForm } from '@mantine/form'
import { FaPaperPlane } from 'react-icons/fa'
import { FiMail } from 'react-icons/fi'
import { MdOutlinePhone } from 'react-icons/md'
import { BsPinMapFill } from 'react-icons/bs'
import classes from './styles.module.css'

const Contact = () => {
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      subject: (value) => (value.length < 5 ? 'Subject must be at least 5 characters' : null),
      message: (value) => (value.length < 10 ? 'Message must be at least 10 characters' : null)
    }
  })

  const handleSubmit = (values: typeof form.values) => {
    console.log(values)
    // Handle form submission here
  }

  return (
    <Element name="contact" className="section bg-dark">
      <Container size="xl">
        <motion.div
          className={classes.sectionTitle}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Title className="title">Get In Touch</Title>
          <Text className="subtitle">Let&apos;s discuss research opportunities or collaborations</Text>
        </motion.div>

        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <motion.div
            className={classes.info}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Title order={3} mb="lg">
              Let&apos;s Start a Conversation
            </Title>

            <Text mb="xl">
              I&apos;m always interested in new research opportunities, collaborations, or discussing innovative
              projects. Whether you have a proposal or just want to connect, feel free to reach out!
            </Text>

            <Stack>
              <Group>
                <ActionIcon size="xl" radius="xl">
                  <FiMail size={20} />
                </ActionIcon>

                <div>
                  <Title order={4}>Email</Title>
                  <Anchor href="mailto:jahidriad.cse@gmail.com">jahidriad.cse@gmail.com</Anchor>
                </div>
              </Group>

              <Group>
                <ActionIcon size="xl" radius="xl">
                  <MdOutlinePhone size={20} />
                </ActionIcon>

                <div>
                  <Title order={4}>Phone</Title>
                  <Anchor href="tel: +12025280333">+1 202-528-0333</Anchor>
                </div>
              </Group>

              <Group>
                <ActionIcon size="xl" radius="xl">
                  <BsPinMapFill size={20} />
                </ActionIcon>

                <div>
                  <Title order={4}>Location</Title>
                  <Text>Washington, DC, USA</Text>
                </div>
              </Group>
            </Stack>
          </motion.div>

          <motion.div
            className={classes.form}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput label="Your Name" placeholder="Enter your name" {...form.getInputProps('name')} />

                <TextInput label="Your Email" placeholder="Enter your email" {...form.getInputProps('email')} />

                <TextInput label="Subject" placeholder="Enter subject" {...form.getInputProps('subject')} />

                <Textarea
                  label="Your Message"
                  rows={3}
                  placeholder="Enter your message"
                  {...form.getInputProps('message')}
                />
              </Stack>

              <Button type="submit" mt="lg" rightSection={<FaPaperPlane />}>
                Send Message
              </Button>
            </form>
          </motion.div>
        </SimpleGrid>
      </Container>
    </Element>
  )
}

export default Contact
