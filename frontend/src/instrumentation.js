/* instrumentation.js */
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const apiKey = import.meta.env.VITE_HONEYCOMB_API_KEY;

try {
    if (apiKey && apiKey !== 'YOUR_HONEYCOMB_API_KEY') {
        const provider = new WebTracerProvider({
            resource: new Resource({
                [SemanticResourceAttributes.SERVICE_NAME]: 'freshmart-frontend',
                'browser.platform': navigator.userAgent,
            }),
        });

        const exporter = new OTLPTraceExporter({
            url: 'https://api.honeycomb.io/v1/traces',
            headers: {
                'x-honeycomb-team': apiKey,
            },
        });

        provider.addSpanProcessor(new BatchSpanProcessor(exporter));
        provider.register();

        registerInstrumentations({
            instrumentations: [
                new DocumentLoadInstrumentation(),
                new XMLHttpRequestInstrumentation(),
            ],
        });

        console.log('OpenTelemetry initialized with Honeycomb');
    } else {
        // console.warn('Honeycomb API Key not found. Tracing disabled.');
    }
} catch (error) {
    console.error('Failed to initialize OpenTelemetry:', error);
}
