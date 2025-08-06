#!/usr/bin/env python3
"""
Script to clear existing data and populate with new professional data analyst dummy data
"""

import sys
import os
import asyncio
import json
from datetime import datetime, timedelta
import uuid

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://kexmzaaufxbzegurxuqz.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleG16YWF1ZnhiemVndXJ4dXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODAxNzAsImV4cCI6MjA2OTg1NjE3MH0.FvcgUsENiqUNcKvoqIUV0ZshImSppjmXobyfb71ufog"

def create_supabase_client():
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def clear_all_data(supabase: Client):
    """Clear all existing data from the database"""
    print("🧹 Clearing existing data...")
    
    # Clear in reverse order of dependencies
    tables_to_clear = [
        'blog_posts',
        'projects', 
        'profile'
    ]
    
    for table in tables_to_clear:
        try:
            # Get all records first
            result = supabase.table(table).select('id').execute()
            if result.data:
                # Delete each record
                for record in result.data:
                    supabase.table(table).delete().eq('id', record['id']).execute()
            print(f"✅ Cleared {table} table")
        except Exception as e:
            print(f"❌ Error clearing {table}: {e}")

def create_profile_data(supabase: Client):
    """Create a comprehensive professional data analyst profile"""
    print("👤 Creating profile data...")
    
    profile_data = {
        "id": str(uuid.uuid4()),
        "name": "Dr. Sarah Mitchell",
        "username": "sarah_data_pro", 
        "title": "Senior Data Analyst & Machine Learning Engineer",
        "bio": "Passionate data scientist with 8+ years of experience transforming complex datasets into actionable business insights. Expert in Python, R, SQL, and advanced machine learning algorithms. Led data-driven initiatives that increased revenue by 40% across multiple Fortune 500 companies.",
        "location": "Seattle, WA",
        "email": "sarah.mitchell@datainsights.com",
        "avatar_url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
        "github_url": "https://github.com/sarahdatapro",
        "linkedin_url": "https://linkedin.com/in/sarahmitchell-data",
        "website_url": "https://sarahmitchell.dev",
        "skills": [
            "Python", "R", "SQL", "Machine Learning", "Deep Learning", 
            "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn",
            "Tableau", "Power BI", "Apache Spark", "AWS", "Docker",
            "Git", "Statistical Analysis", "Data Visualization", "ETL",
            "A/B Testing", "Predictive Modeling", "Natural Language Processing"
        ],
        "stats": json.dumps({
            "projectsLed": "25+",
            "hoursAnalyzed": "2000+", 
            "clientsServed": "150+"
        }),
        "created_at": (datetime.now() - timedelta(days=1095)).isoformat(),  # 3 years ago
        "updated_at": datetime.now().isoformat()
    }
    
    try:
        result = supabase.table('profile').insert(profile_data).execute()
        print("✅ Profile created successfully")
        return result.data[0]['id'] if result.data else None
    except Exception as e:
        print(f"❌ Error creating profile: {e}")
        return None

def create_projects_data(supabase: Client):
    """Create comprehensive project portfolio"""
    print("🚀 Creating projects data...")
    
    projects = [
        {
            "id": str(uuid.uuid4()),
            "title": "Customer Churn Prediction Model",
            "description": "Developed a machine learning model to predict customer churn with 94% accuracy using ensemble methods. Implemented feature engineering pipeline and A/B testing framework that reduced churn by 23% and saved $2.4M annually.",
            "category": "Machine Learning",
            "tags": ["Python", "Scikit-learn", "XGBoost", "A/B Testing", "Feature Engineering"],
            "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
            "demo_url": "https://churn-predictor-demo.herokuapp.com",
            "github_url": "https://github.com/sarahdatapro/churn-prediction",

            "featured": True,
            "views": 2847,
            "likes": 156,
            "comments": 23,
            "created_at": (datetime.now() - timedelta(days=180)).isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Real-Time Sales Analytics Dashboard",
            "description": "Built an interactive real-time dashboard using React, D3.js, and WebSocket connections to visualize sales performance across 15 regions. Features predictive analytics, automated alerts, and executive reporting capabilities.",
            "category": "Data Visualization",
            "tags": ["React", "D3.js", "Python", "FastAPI", "PostgreSQL", "WebSockets"],
            "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
            "demo_url": "https://sales-dashboard-demo.netlify.app",
            "github_url": "https://github.com/sarahdatapro/sales-dashboard",
            "featured": True,
            "views": 1923,
            "likes": 89,
            "comments": 12,
            "created_at": (datetime.now() - timedelta(days=150)).isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Natural Language Processing for Reviews",
            "description": "Implemented sentiment analysis and topic modeling on 500K+ customer reviews using BERT and LDA. Created automated classification system that improved customer service response time by 60%.",
            "category": "Natural Language Processing",
            "tags": ["Python", "BERT", "spaCy", "NLTK", "Topic Modeling", "Sentiment Analysis"],
            "image_url": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop",
            "demo_url": "https://nlp-reviews-demo.herokuapp.com",
            "github_url": "https://github.com/sarahdatapro/nlp-reviews",
            "featured": False,
            "views": 1456,
            "likes": 73,
            "comments": 8,
            "created_at": (datetime.now() - timedelta(days=120)).isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Supply Chain Optimization Algorithm",
            "description": "Developed optimization algorithms using linear programming and genetic algorithms to minimize supply chain costs. Achieved 18% reduction in logistics expenses and improved delivery times by 25%.",
            "category": "Optimization",
            "tags": ["Python", "SciPy", "Linear Programming", "Genetic Algorithms", "Operations Research"],
            "image_url": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop",
            "demo_url": "https://supply-chain-optimizer.herokuapp.com",
            "github_url": "https://github.com/sarahdatapro/supply-chain",
            "featured": False,
            "views": 987,
            "likes": 45,
            "comments": 5,
            "created_at": (datetime.now() - timedelta(days=90)).isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Time Series Forecasting Platform",
            "description": "Built automated forecasting platform using ARIMA, Prophet, and LSTM models for financial and sales data. Platform serves 50+ business units with automated model selection and performance monitoring.",
            "category": "Time Series Analysis",
            "tags": ["Python", "Prophet", "LSTM", "TensorFlow", "Time Series", "Forecasting"],
            "image_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
            "demo_url": "https://forecasting-platform.netlify.app",
            "github_url": "https://github.com/sarahdatapro/forecasting-platform",
            "featured": True,
            "views": 2156,
            "likes": 134,
            "comments": 19,
            "created_at": (datetime.now() - timedelta(days=60)).isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    ]
    
    try:
        for project in projects:
            result = supabase.table('projects').insert(project).execute()
        print(f"✅ Created {len(projects)} projects")
    except Exception as e:
        print(f"❌ Error creating projects: {e}")

def create_blog_posts_data(supabase: Client):
    """Create comprehensive blog posts"""
    print("📝 Creating blog posts data...")
    
    blog_posts = [
        {
            "id": str(uuid.uuid4()),
            "title": "Advanced Feature Engineering Techniques for Machine Learning",
            "slug": "advanced-feature-engineering-techniques",
            "content": """# Advanced Feature Engineering Techniques for Machine Learning

Feature engineering is often the difference between a mediocre and an exceptional machine learning model. After years of working with complex datasets, I've compiled the most impactful techniques that consistently improve model performance.

## Why Feature Engineering Matters

Feature engineering transforms raw data into meaningful representations that algorithms can understand and learn from effectively. Good features can make a simple model outperform a complex one with poor features.

## 1. Polynomial and Interaction Features

Creating polynomial features captures non-linear relationships:

```python
from sklearn.preprocessing import PolynomialFeatures
poly = PolynomialFeatures(degree=2, interaction_only=True)
X_poly = poly.fit_transform(X)
```

## 2. Target Encoding for High Cardinality Categories

For categorical variables with many unique values:

```python
def target_encode(df, column, target):
    mean_target = df.groupby(column)[target].mean()
    return df[column].map(mean_target)
```

## 3. Time-Based Features

Extract meaningful patterns from datetime data:

```python
df['hour'] = df['timestamp'].dt.hour
df['day_of_week'] = df['timestamp'].dt.dayofweek
df['is_weekend'] = df['day_of_week'].isin([5, 6])
```

## Real-World Impact

In a recent customer churn project, proper feature engineering improved model accuracy from 78% to 94%. The key was creating interaction features between customer behavior metrics and temporal patterns.

## Key Takeaways

1. Domain knowledge is crucial for creating meaningful features
2. Always validate feature importance after creation
3. Consider computational costs in production systems
4. Use cross-validation to avoid overfitting to feature engineering choices

Remember: great features tell a story about your data that algorithms can understand.
""",
            "excerpt": "Discover advanced feature engineering techniques that can transform your machine learning models from mediocre to exceptional. Learn polynomial features, target encoding, and time-based transformations with real-world examples.",
            "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",

            "tags": ["Machine Learning", "Feature Engineering", "Python", "Data Science", "Model Performance"],
            "published": True,
            "reading_time": 8,
            "views": 5248,
            "likes": 287,
            "created_at": (datetime.now() - timedelta(days=45)).isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Building Production-Ready ML Pipelines with MLOps",
            "slug": "production-ml-pipelines-mlops",
            "content": """# Building Production-Ready ML Pipelines with MLOps

Moving machine learning models from notebooks to production requires robust MLOps practices. Here's a comprehensive guide based on deploying 20+ models to production.

## The MLOps Pipeline Architecture

A production ML pipeline should include:

1. **Data Validation & Quality Checks**
2. **Model Training & Validation** 
3. **Model Deployment & Monitoring**
4. **Automated Retraining**

## Infrastructure Components

### 1. Data Pipeline

```python
import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions

def create_data_pipeline():
    with beam.Pipeline(options=PipelineOptions()) as pipeline:
        (pipeline 
         | 'Read Data' >> beam.io.ReadFromBigQuery(query=sql_query)
         | 'Validate Data' >> beam.Map(validate_data_quality)
         | 'Transform Features' >> beam.Map(transform_features)
         | 'Write to Storage' >> beam.io.WriteToParquet(output_path))
```

### 2. Model Training

```python
import mlflow
from sklearn.model_selection import cross_val_score

def train_model(X_train, y_train):
    with mlflow.start_run():
        model = RandomForestClassifier(n_estimators=100)
        scores = cross_val_score(model, X_train, y_train, cv=5)
        
        mlflow.log_metric("cv_mean", scores.mean())
        mlflow.log_metric("cv_std", scores.std())
        mlflow.sklearn.log_model(model, "model")
```

### 3. Model Deployment

```python
from kubernetes import client, config

def deploy_model(model_version):
    config.load_incluster_config()
    deployment = create_deployment_spec(model_version)
    
    v1 = client.AppsV1Api()
    v1.create_namespaced_deployment(
        body=deployment,
        namespace="ml-models"
    )
```

## Monitoring and Observability

Monitor data drift, model performance, and system health:

```python
import evidently
from evidently.dashboard import Dashboard
from evidently.tabs import DataDriftTab

def monitor_data_drift(reference_data, current_data):
    drift_dashboard = Dashboard(tabs=[DataDriftTab()])
    drift_dashboard.calculate(reference_data, current_data)
    return drift_dashboard
```

## Best Practices Learned

1. **Automate Everything**: From data validation to model deployment
2. **Version Everything**: Data, code, models, and configurations
3. **Monitor Continuously**: Set up alerts for drift and performance degradation
4. **Test Rigorously**: Unit tests, integration tests, and shadow deployment

## Results

Implementing proper MLOps reduced model deployment time from weeks to hours and improved model reliability by 80%.

The key is treating ML systems as software systems with proper engineering practices.
""",
            "excerpt": "Learn how to build robust, production-ready machine learning pipelines using MLOps best practices. Cover data validation, model deployment, monitoring, and automated retraining.",
            "image_url": "https://images.unsplash.com/photo-1518186233392-c232efbf2373?w=800&h=600&fit=crop",
            "tags": ["MLOps", "Machine Learning", "DevOps", "Production Systems", "Model Deployment"],
            "published": True,
            "reading_time": 12,
            "views": 3924,
            "likes": 198,
            "created_at": (datetime.now() - timedelta(days=30)).isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Deep Dive into Time Series Forecasting with Prophet",
            "slug": "time-series-forecasting-prophet",
            "content": """# Deep Dive into Time Series Forecasting with Prophet

Time series forecasting is crucial for business planning. Facebook's Prophet has revolutionized how we approach forecasting problems. Here's everything you need to know.

## Why Prophet?

Prophet handles the complexities of time series data:
- **Seasonality**: Automatic detection of daily, weekly, yearly patterns
- **Holidays**: Built-in holiday effects
- **Missing Data**: Robust handling of gaps
- **Outliers**: Automatic outlier detection

## Basic Implementation

```python
from prophet import Prophet
import pandas as pd

# Prepare data
df = pd.DataFrame({'ds': dates, 'y': values})

# Initialize and fit model
model = Prophet()
model.fit(df)

# Make predictions
future = model.make_future_dataframe(periods=365)
forecast = model.predict(future)
```

## Advanced Features

### Custom Seasonality

```python
model = Prophet()
model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
model.add_seasonality(name='quarterly', period=91.25, fourier_order=8)
```

### External Regressors

```python
model = Prophet()
model.add_regressor('promotion_intensity')
model.add_regressor('competitor_price')
model.fit(df)
```

### Holiday Effects

```python
holidays = pd.DataFrame({
    'holiday': 'black_friday',
    'ds': pd.to_datetime(['2019-11-29', '2020-11-27', '2021-11-26']),
    'lower_window': -1,
    'upper_window': 1,
})

model = Prophet(holidays=holidays)
```

## Cross-Validation

```python
from prophet.diagnostics import cross_validation, performance_metrics

df_cv = cross_validation(model, initial='730 days', period='180 days', horizon='365 days')
df_p = performance_metrics(df_cv)
```

## Real-World Case Study

For an e-commerce client, Prophet improved forecast accuracy by 35% compared to traditional ARIMA models:

- **Dataset**: 3 years of daily sales data
- **Seasonality**: Weekly and yearly patterns
- **External factors**: Marketing campaigns, holidays
- **Result**: MAPE reduced from 18% to 12%

## When NOT to Use Prophet

Prophet isn't suitable for:
- Sub-daily data with complex patterns
- Very short time series (< 2 years)
- Data with abrupt structural changes
- Financial time series with high volatility

## Performance Optimization

```python
# Parallel processing for multiple series
from multiprocessing import Pool

def fit_prophet(series_data):
    model = Prophet()
    model.fit(series_data)
    return model.predict(future_df)

with Pool() as pool:
    results = pool.map(fit_prophet, time_series_list)
```

## Key Takeaways

1. Prophet excels at business forecasting problems
2. Automatic seasonality detection saves significant time
3. Easy to interpret and explain to stakeholders
4. Great for forecasting with uncertainty intervals
5. Works well with missing data and outliers

Prophet has become my go-to tool for most forecasting problems. Its simplicity and robustness make it perfect for production systems.
""",
            "excerpt": "Master time series forecasting with Facebook's Prophet. Learn advanced techniques, custom seasonality, external regressors, and real-world optimization strategies.",
            "image_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
            "featured_image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
            "tags": ["Time Series", "Forecasting", "Prophet", "Python", "Data Science"],
            "published": True,
            "reading_time": 10,
            "views": 4156,
            "likes": 234,
            "created_at": (datetime.now() - timedelta(days=15)).isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "SQL Optimization Techniques for Large Datasets",
            "slug": "sql-optimization-large-datasets",
            "content": """# SQL Optimization Techniques for Large Datasets

Working with terabyte-scale datasets requires mastering SQL optimization. Here are the techniques that have saved me countless hours and compute resources.

## Query Optimization Fundamentals

### 1. Index Strategy

```sql
-- Create composite indexes for common query patterns
CREATE INDEX idx_sales_date_region ON sales(sale_date, region_id, product_id);

-- Use partial indexes for filtered queries
CREATE INDEX idx_active_customers ON customers(customer_id) WHERE status = 'active';
```

### 2. Query Rewriting

```sql
-- Instead of this (slow)
SELECT * FROM orders 
WHERE order_date >= '2023-01-01' 
AND customer_id IN (SELECT customer_id FROM customers WHERE region = 'US');

-- Use this (fast)
SELECT o.* FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id
WHERE o.order_date >= '2023-01-01' 
AND c.region = 'US';
```

## Advanced Techniques

### Window Functions vs Subqueries

```sql
-- Efficient window function approach
SELECT 
    customer_id,
    order_date,
    amount,
    SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) as running_total
FROM orders;
```

### CTEs for Complex Logic

```sql
WITH customer_metrics AS (
    SELECT 
        customer_id,
        COUNT(*) as order_count,
        AVG(amount) as avg_order_value,
        MAX(order_date) as last_order_date
    FROM orders
    GROUP BY customer_id
),
segmentation AS (
    SELECT 
        *,
        CASE 
            WHEN order_count >= 10 AND avg_order_value >= 100 THEN 'VIP'
            WHEN order_count >= 5 THEN 'Regular'
            ELSE 'New'
        END as segment
    FROM customer_metrics
)
SELECT segment, COUNT(*) as customer_count
FROM segmentation
GROUP BY segment;
```

## Partitioning Strategies

### Range Partitioning

```sql
CREATE TABLE sales (
    sale_id BIGINT,
    sale_date DATE,
    amount DECIMAL(10,2)
) PARTITION BY RANGE (sale_date);

CREATE TABLE sales_2023_q1 PARTITION OF sales
FOR VALUES FROM ('2023-01-01') TO ('2023-04-01');
```

### Hash Partitioning

```sql
CREATE TABLE user_events (
    user_id BIGINT,
    event_time TIMESTAMP,
    event_type VARCHAR(50)
) PARTITION BY HASH (user_id);
```

## Monitoring and Analysis

### Query Execution Plans

```sql
EXPLAIN (ANALYZE, BUFFERS) 
SELECT c.name, COUNT(o.order_id)
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE c.region = 'US'
GROUP BY c.name;
```

### Performance Statistics

```sql
-- PostgreSQL query performance
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_tup_read DESC;
```

## Real-World Optimizations

### Case Study: E-commerce Analytics

**Problem**: Daily reporting queries taking 45+ minutes
**Solution**: Implemented materialized views with incremental refresh

```sql
CREATE MATERIALIZED VIEW daily_sales_summary AS
SELECT 
    DATE(order_date) as sale_date,
    product_category,
    region,
    COUNT(*) as order_count,
    SUM(amount) as total_revenue
FROM orders o
JOIN products p ON o.product_id = p.product_id
JOIN customers c ON o.customer_id = c.customer_id
GROUP BY DATE(order_date), product_category, region;

-- Refresh incrementally
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales_summary;
```

**Result**: Query time reduced from 45 minutes to 30 seconds

### Memory Management

```sql
-- Optimize work_mem for large sorts
SET work_mem = '256MB';

-- Use temp tablespaces for large operations
CREATE TEMP TABLE temp_analysis AS
SELECT * FROM large_table WHERE complex_condition;
```

## Best Practices

1. **Profile Before Optimizing**: Use EXPLAIN ANALYZE
2. **Index Strategically**: Don't over-index
3. **Partition Large Tables**: Improve query performance
4. **Use Appropriate Data Types**: Smaller types = better performance
5. **Batch Operations**: Reduce transaction overhead

## Tools and Monitoring

- **pg_stat_statements**: Track query performance
- **pgbadger**: Log analysis
- **Query plan visualizers**: Better understanding of execution

## Performance Gains

These optimizations typically achieve:
- 70-90% reduction in query execution time
- 50-80% reduction in resource consumption
- 90% improvement in concurrent query performance

Remember: The best optimization is often avoiding the query altogether through better data modeling and caching strategies.
""",
            "excerpt": "Master SQL optimization for large datasets. Learn indexing strategies, query rewriting, partitioning, and real-world techniques that reduce query times by 90%.",
            "image_url": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=600&fit=crop",
            "tags": ["SQL", "Database Optimization", "PostgreSQL", "Performance", "Large Datasets"],
            "published": True,
            "reading_time": 11,
            "views": 3478,
            "likes": 167,
            "created_at": (datetime.now() - timedelta(days=7)).isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    ]
    
    try:
        for post in blog_posts:
            result = supabase.table('blog_posts').insert(post).execute()
        print(f"✅ Created {len(blog_posts)} blog posts")
    except Exception as e:
        print(f"❌ Error creating blog posts: {e}")

def main():
    """Main function to orchestrate data population"""
    print("🚀 Starting data population process...")
    
    # Create Supabase client
    supabase = create_supabase_client()
    
    # Clear existing data
    clear_all_data(supabase)
    
    # Create new data
    profile_id = create_profile_data(supabase)
    create_projects_data(supabase)
    create_blog_posts_data(supabase)
    
    print("\n🎉 Data population completed successfully!")
    print("\nCreated:")
    print("- 1 Professional Profile (Dr. Sarah Mitchell)")
    print("- 5 Comprehensive Projects")
    print("- 4 Technical Blog Posts")
    print("\n💡 All data is now ready for the dynamic portfolio!")

if __name__ == "__main__":
    main()