import os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource

def setup_tracer():
    """
    Configure OpenTelemetry tracer for the FreshMart Retention system.
    Sets up a global TracerProvider with OTLP Exporter (Honeycomb) and Console fallback.
    """
    # Create Resource to identify the service
    resource = Resource.create({
        "service.name": os.getenv("OTEL_SERVICE_NAME", "freshmart-retention"),
        "service.version": "1.0.0"
    })

    # Initialize TracerProvider
    provider = TracerProvider(resource=resource)

    honeycomb_key = os.getenv("HONEYCOMB_API_KEY")
    
    if honeycomb_key and honeycomb_key != "YOUR_HONEYCOMB_API_KEY":
        # Configure OTLPSpanExporter for Honeycomb
        otlp_exporter = OTLPSpanExporter(
            endpoint="https://api.honeycomb.io/v1/traces",
            headers={"x-honeycomb-team": honeycomb_key}
        )
        provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
        print(f"[INFO] OpenTelemetry configured for Honeycomb")
    else:
        print("[WARN] Honeycomb API Key not found. Tracing to Console only.")

    # Configure ConsoleSpanExporter to output traces to stdout (as secondary or primary)
    # Useful for debugging locally
    processor = BatchSpanProcessor(ConsoleSpanExporter())
    provider.add_span_processor(processor)

    # Set as global TracerProvider
    trace.set_tracer_provider(provider)
