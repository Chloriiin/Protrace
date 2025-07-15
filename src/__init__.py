from Preprocessing import *
from Sample import *
from ProtPlotting import *

import pandas as pd
import numpy as np

header = 30

df = pd.read_excel('/Users/zhijiang/Desktop/University/Bio Lab/Remote tasks/CA350ExampleData/CA350_unprocessedData/dataset2/TCA8_forTSAR_04152024.xlsx',header=header, )
df = pre_process_df(df, 361)

DMSO = Sample(df, 'DMSO', 'B2') #background only
sample_B = Sample(df, 'sample_B', 'B2', ['B3','B4'])
sample_C = Sample(df, 'sample_C', 'C2', ['C3','C4'])
sample_D = Sample(df, 'sample_D', 'D2', ['D3','D4'])
sample_B_plain = Sample(df, 'sample_B_plain', None, ['B3','B4']) #no background standardization
samples = [DMSO, sample_B, sample_C, sample_D, sample_B_plain]


# Assume you already have your list of Sample objects called `samples`
fig, ax = plot_stdized_samples(samples, time_col='Time', 
                               figsize=(9,5), 
                               font='Arial', 
                               title="CA A$_{350}$ Assembly", 
                               subtitle="WT CA + Compound Only")
# please do not attempt changing height 

# If you’re in a script:
plt.show()
# Or save to disk:
fig.savefig("A350_traces.svg", bbox_inches="tight")
