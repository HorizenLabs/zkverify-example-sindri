# zkverify-example-sindri

## Setup

1. Install Dependencies
```shell
npm install
```

2. Environment Variables
- Set `SINDRI_API_KEY` environment variable (e.g. in .env file) 
- Set zkVerify wallet `SEED_PHRASE` environment variable (e.g. in .env file)

3. Compile & Deploy the circuit on Sindri
```shell
npx tsx compile.ts
```

4. Generate a proof on sindri to test everything is setup
```shell
npx tsx prove.ts
```

## Generate with Sindri and verify with zkVerify

### Backend example

Generate a proof using Sindri then verify the proof using zkVerify
```shell
npx tsx verify.ts
```

### Frontend example with backend server calls
```shell
npm run dev
```

# Additional Resources

[Project creation and Sindri instructions (For new projects)](https://sindri.app/docs/getting-started/typescript-sdk/)

[zkVerify](https://zkverify.io)

[zkVerifyJS](https://www.npmjs.com/package/zkverifyjs)
