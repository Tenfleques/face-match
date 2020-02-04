import numpy as np
import matplotlib.pyplot as plt

from PIL import Image


def plot_sample(target_path, wild_path, distance, size=(5, 5)):
    target = np.array(Image.open(target_path))
    wild = np.array(Image.open(wild_path))

    fig = plt.figure(figsize=size)

    ax1 = fig.add_subplot(1,2,1)
    ax2 = fig.add_subplot(1,2,2)

    ax2.set_title("Distance {}".format(distance))

    ax1.imshow(target)    
    ax2.imshow(wild)

    for i in (ax1, ax2):
        i.set_xticks([])
        i.set_yticks([])