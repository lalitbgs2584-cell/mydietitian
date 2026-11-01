import { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthScaffold } from '@/components/auth/AuthScaffold'
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'
import { AppText } from '@/components/ui/AppText'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { PasswordField } from '@/components/ui/PasswordField'
import { TextField } from '@/components/ui/TextField'
import { useSignIn } from '@/auth/hooks/useSignIn'
import { signInSchema, type SignInValues } from '@/auth/schemas'
import { failureHaptic } from '@/auth/hooks/shared'
import { usePrefsStore } from '@/store/prefs.store'

export default function SignInScreen() {
  const params = useLocalSearchParams<{ email?: string }>()
  const emailParam = typeof params.email === 'string' ? params.email : ''
  const { loading, submit } = useSignIn()
  const [formError, setFormError] = useState<string | null>(null)
  const authNotice = usePrefsStore((state) => state.authNotice)
  const consumeAuthNotice = usePrefsStore((state) => state.consumeAuthNotice)
  const lastAuthMethod = usePrefsStore((state) => state.lastAuthMethod)
  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const { control, handleSubmit, setError, setValue, getValues, formState: { errors } } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: emailParam, password: '' },
  })

  useEffect(() => { if (emailParam) setValue('email', emailParam) }, [emailParam, setValue])
  useEffect(() => {
    if (authNotice) {
      setFormError(authNotice === 'expired' ? 'Your session expired. Please sign in again.' : 'This account has been suspended. Contact support.')
      consumeAuthNotice()
    }
  }, [authNotice, consumeAuthNotice])

  const onSubmit = async (values: SignInValues) => {
    setFormError(null)
    const error = await submit(values)
    if (!error) return
    if (error.kind === 'field' && error.field) setError(error.field as 'email' | 'password', { message: error.message })
    else if (error.kind === 'form') {
      setFormError(error.message)
    }
  }

  return (
    <AuthScaffold title="Welcome back" subtitle="Sign in to continue your plan.">
      <View style={styles.form}>
        {formError ? <Banner tone={authNotice === 'expired' ? 'info' : 'error'} message={formError} /> : null}
        <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            ref={emailRef}
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        )} />
        <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
          <PasswordField
            ref={passwordRef}
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={() => { void handleSubmit(onSubmit, () => void failureHaptic())() }}
          />
        )} />
        <Button label="Sign in" loading={loading} onPress={() => { void handleSubmit(onSubmit, () => void failureHaptic())() }} />
        <Divider />
        <SocialAuthButtons compact lastUsed={lastAuthMethod === 'email' ? null : lastAuthMethod} onError={setFormError} />
        <View style={styles.footer}>
          <AppText variant="body" tone="muted">New here? </AppText>
          <Pressable accessibilityRole="link" onPress={() => router.replace('/sign-up')}><AppText variant="link" tone="gold">Create an account</AppText></Pressable>
        </View>
      </View>
    </AuthScaffold>
  )
}

const styles = StyleSheet.create({ form: { gap: 16 }, footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', minHeight: 48 } })
