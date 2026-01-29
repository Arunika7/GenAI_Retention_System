import os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource

def setup_tracing():
    """
    Configure OpenTelemetry tracing for the application.
    Sets up a TracerProvider with OTLP Exporter (Honeycomb) and Console fallback.
    """
    # Create a Resource to identify the service
    resource = Resource.create({
        "service.name": os.getenv("OTEL_SERVICE_NAME", "freshmart-retention-api"),
        "service.version": "1.0.0"
    })

    # Initialize the TracerProvider
    provider = TracerProvider(resource=resource)

    # Configure OTLP Exporter (Uses env vars: OTEL_EXPORTER_OTLP_ENDPOINT, HEADERS, etc.)
    try:
        # We initialized the specific HTTP exporter, it will read env vars by default if not passed args
        otlp_exporter = OTLPSpanExporter() 
        provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
        print(f"[INFO] OpenTelemetry configured for Honeycomb (HTTP/Protobuf)")
    except Exception as e:
        print(f"[ERROR] Failed to configure Honeycomb exporter: {e}")
        print("[WARN] Falling back to Console tracing.")
    
    # Configure the ConsoleSpanExporter as fallback/debug
    processor = BatchSpanProcessor(ConsoleSpanExporter())
    provider.add_span_processor(processor)

    # Set the global TracerProvider
    trace.set_tracer_provider(provider)
