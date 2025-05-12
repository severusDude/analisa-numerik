# Hitung rata-rata pertumbuhan tahunan
def rata_pertumbuhan(data_series):
    growth_rates = []
    for i in range(1, len(data_series)):
        growth = (data_series[i] - data_series[i-1]) / data_series[i-1]
        growth_rates.append(growth)
    return sum(growth_rates) / len(growth_rates), growth_rates