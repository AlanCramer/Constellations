import pandas as pd

df = pd.read_csv("hyg_v42.csv")

# Only keep stars with known magnitude
df = df[df["mag"].notnull()]

# Add a 'name' column: prefer 'proper', fall back to 'HRxxx'
def resolve_name(row):
    if isinstance(row["proper"], str) and row["proper"].strip():
        return row["proper"].strip()
    elif not pd.isnull(row["hr"]):
        return f"HR{int(row['hr'])}"
    else:
        return None

df["name"] = df.apply(resolve_name, axis=1)

# Sort by brightness
df_sorted = df.sort_values("mag")

# Select top N
df_top = df_sorted.head(10000)

# Save only needed columns
result = df_top[["name", "hr", "ra", "dec", "mag"]]

result = result.copy()
result.loc[:, "hr"] = result["hr"].astype("Int64")
print(result.dtypes)

result.to_csv("stars10000.csv", index=False)

print(result.head())
