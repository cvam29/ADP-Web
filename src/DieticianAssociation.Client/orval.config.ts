export default {
  api: {
    input: './openapi.json',
    output: {
      target: './services/generated.ts',
      client: 'axios',
      override: {
        mutator: {
          path: './services/api-client.ts',
          name: 'apiClient',
        },
      },
    },
  },
}
